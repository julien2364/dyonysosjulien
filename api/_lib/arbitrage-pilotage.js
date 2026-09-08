const ARBITRAGE_PROJECT_ID = 'prj_YNDpcwcBx3TfwNUF3TFDpTF6U8YJ';
const VERCEL_TEAM_ID = 'team_V2XarT2PcWGD86aDLfpoA5xa';
const REQUEST_TIMEOUT_MS = 8000;

const COMPETITORS = [
  {
    name: 'SourceMogul',
    trial: '7 jours, sans carte, accès complet',
    price: '£79.99/mois',
    signal: 'Essai très proche, mais sans quota public annoncé.',
    source: 'https://www.sourcemogul.com/pricing',
    proof: 'VÉRIFIÉ',
    checkedAt: '2026-09-08',
  },
  {
    name: 'SellerAmp',
    trial: '14 jours',
    price: 'à partir de $19.95/mois',
    signal: '1 000 analyses/mois sur le premier abonnement.',
    source: 'https://selleramp.com/pricing/',
    proof: 'VÉRIFIÉ',
    checkedAt: '2026-09-08',
  },
  {
    name: 'Actorio',
    trial: '14 jours, carte requise, accès complet',
    price: '€79 à €597/mois',
    signal: 'Prix nettement plus élevé et engagement plus fort.',
    source: 'https://actorio.com/pricing/',
    proof: 'VÉRIFIÉ',
    checkedAt: '2026-09-08',
  },
];

const SCORECARD = [
  ['Demande / marché', 72],
  ['Positionnement', 66],
  ['Offre / prix', 80],
  ['Produit / activation', 74],
  ['UX / conversion', 84],
  ['Technique / fiabilité', 86],
  ['Sécurité / confiance', 68],
  ['SEO', 55],
  ['Social / distribution', 70],
  ['Email / CRM', 64],
  ['Analytics / attribution', 50],
  ['Rétention', 22],
].map(([name, score]) => ({ name, score, proof: 'ESTIMÉ', confidence: 'moyenne' }));

function withTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

function supabaseConfig() {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, key, configured: Boolean(url && key) };
}

async function readCommercialSnapshot() {
  const config = supabaseConfig();
  if (!config.configured) {
    return { ok: false, state: 'not_configured', error: 'Connexion Supabase non configurée.' };
  }

  try {
    const response = await withTimeout(`${config.url}/rest/v1/rpc/arb_cockpit_commercial`, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    if (!response.ok) throw new Error(`Supabase HTTP ${response.status}`);
    return { ok: true, state: 'live', value: await response.json() };
  } catch (error) {
    return {
      ok: false,
      state: error && error.name === 'AbortError' ? 'timeout' : 'error',
      error: error && error.message ? error.message : String(error),
    };
  }
}

async function readVercelTraffic() {
  const token = process.env.VERCEL_ANALYTICS_TOKEN || process.env.VERCEL_API_TOKEN || '';
  if (!token) return { ok: false, state: 'not_configured', value: null };

  const until = new Date();
  const since = new Date(until);
  since.setUTCDate(since.getUTCDate() - 29);
  const url = new URL('https://api.vercel.com/v1/query/web-analytics/visits/count');
  url.searchParams.set('teamId', VERCEL_TEAM_ID);
  url.searchParams.set('projectId', ARBITRAGE_PROJECT_ID);
  url.searchParams.set('since', since.toISOString());
  url.searchParams.set('until', until.toISOString());

  try {
    const response = await withTimeout(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Vercel Analytics HTTP ${response.status}`);
    const body = await response.json();
    return {
      ok: true,
      state: 'live',
      value: {
        visitors30d: Number(body?.data?.visitors || 0),
        pageviews30d: Number(body?.data?.pageviews || 0),
        capturedAt: until.toISOString(),
      },
    };
  } catch (error) {
    return {
      ok: false,
      state: error && error.name === 'AbortError' ? 'timeout' : 'error',
      value: null,
      error: error && error.message ? error.message : String(error),
    };
  }
}

async function probe(url, options = {}) {
  try {
    const response = await withTimeout(url, { redirect: 'follow', ...options });
    return {
      reachable: response.ok,
      status: response.status,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      reachable: false,
      status: null,
      checkedAt: new Date().toISOString(),
      error: error && error.name === 'AbortError' ? 'timeout' : 'unreachable',
    };
  }
}

async function readInternalServices() {
  const [automation, odoo, postiz] = await Promise.all([
    probe('https://automation.dyonysos.fr/'),
    probe('https://odoo.dyonysos.fr/web/webclient/version_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
    }),
    probe('https://social.dyonysos.fr/auth'),
  ]);
  return { automation, odoo, postiz };
}

const integer = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

function buildDashboard(snapshotResult, trafficResult, now = new Date(), serviceResults = {}) {
  const live = snapshotResult.ok ? snapshotResult.value : {};
  const subscriptions = live.subscriptions || {};
  const usage = live.usage || {};
  const accounts = live.accounts || {};
  const social = live.social || {};
  const socialStatus = social.by_status || {};
  const checks = live.functional_checks || {};
  const trial = live.trial || {};
  const traffic = trafficResult.ok ? trafficResult.value : null;
  const paid = integer(subscriptions.active);
  const trials = integer(subscriptions.trialing);
  const productChecksOk = integer(checks.total) > 0 && integer(checks.failed) === 0;

  const gates = [
    {
      id: 'funnel',
      title: 'Produit et tunnel',
      status: productChecksOk ? 'go' : 'review',
      proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'BLOQUÉ',
      detail: productChecksOk
        ? `${integer(checks.ok)}/${integer(checks.total)} contrôles fonctionnels réussis.`
        : 'Le dernier passage fonctionnel ne permet pas de confirmer la chaîne.',
      observedAt: checks.last_update || live.captured_at || null,
    },
    {
      id: 'trial',
      title: 'Essai sans carte',
      status: integer(trial.jours_essai_plan) === 7 && integer(trial.recherches_essai) === 30 && integer(trial.analyses_essai) === 50 ? 'go' : 'review',
      proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'BLOQUÉ',
      detail: `${integer(trial.jours_essai_plan)} jours · ${integer(trial.recherches_essai)} recherches · ${integer(trial.analyses_essai)} analyses`,
      observedAt: live.captured_at || null,
    },
    {
      id: 'captcha',
      title: 'CAPTCHA et rate-limit',
      status: 'declared',
      proof: 'DÉCLARÉ',
      detail: 'Validé par la direction ; preuve technique indépendante à rattacher au journal.',
      observedAt: '2026-09-08T00:00:00.000Z',
    },
    {
      id: 'tax',
      title: 'TVA et Stripe Tax',
      status: 'review',
      proof: 'À CONFIRMER',
      detail: 'Stripe Tax est actif et le dernier checkout observé calculait la taxe, mais aucune immatriculation fiscale Stripe n’était enregistrée lors du contrôle.',
      observedAt: '2026-09-08T20:48:00.000Z',
    },
  ];

  const projectionRows = [
    ['J+1', '0 vente', '0 à 1 vente', '0 à 1 vente', 'Valider le cockpit et obtenir 1 parcours complet mesuré'],
    ['J+7', '0 vente', '0 à 1 vente', '1 à 2 ventes', '10 essais qualifiés, 5 activations démontrées'],
    ['J+15', '0 à 1 vente', '1 à 2 ventes', '2 à 4 ventes', 'Conserver uniquement les 2 canaux ayant produit un signal'],
    ['J+30', '0 à 2 ventes', '2 à 5 ventes', '5 à 9 ventes', 'Décider accélérer, itérer ou remettre en HOLD'],
  ].map(([horizon, prudent, central, high, learningTarget]) => ({
    horizon, prudent, central, high, learningTarget, proof: 'PROJECTION', confidence: 'faible',
  }));

  return {
    capturedAt: now.toISOString(),
    refreshSeconds: 60,
    sources: {
      supabase: { state: snapshotResult.state, capturedAt: live.captured_at || null },
      vercel: { state: trafficResult.state, capturedAt: traffic?.capturedAt || null },
      stripe: { state: 'verified_snapshot', capturedAt: '2026-09-08T20:48:00.000Z' },
      odoo: { state: 'verified_snapshot', capturedAt: '2026-09-08T00:00:00.000Z' },
    },
    verdict: {
      acquisition: 'HOLD — payante ou massive',
      execution: 'GO — activation organique et CRM mesurées',
      decision: 'RÉPARER / MESURER AVANT ACQUISITION',
      confidence: 'élevée sur le tunnel, faible sur la vente',
      bottleneck: paid > 0 ? 'Rétention et montée en charge' : 'Activation → premier abonnement payé',
      reason: paid > 0
        ? 'Une conversion payante est observée ; le prochain enjeu est la répétabilité.'
        : 'Le produit est testable, mais aucun abonnement actif payé n’est observé dans la source métier.',
    },
    kpis: {
      visitors30d: traffic ? traffic.visitors30d : null,
      pageviews30d: traffic ? traffic.pageviews30d : null,
      accounts: integer(accounts.accounts),
      activeTrials: trials,
      activePaid: paid,
      searches: integer(usage.searches),
      analyses: integer(usage.analyses),
      savedSearches: integer(live.saved_searches?.total),
      productsSaved: integer(live.products?.total),
      socialPublished: integer(socialStatus.publie),
      socialToReview: integer(socialStatus.a_valider),
      functionalChecksOk: integer(checks.ok),
      functionalChecksTotal: integer(checks.total),
    },
    funnel: [
      { label: 'Visiteurs qualifiés · 30 j', value: traffic ? traffic.visitors30d : null, proof: traffic ? 'VÉRIFIÉ' : 'À CONFIRMER' },
      { label: 'Comptes Arbitrage+', value: integer(accounts.accounts), proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'BLOQUÉ' },
      { label: 'Utilisateurs avec usage', value: integer(usage.users), proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'BLOQUÉ' },
      { label: 'Essais actifs', value: trials, proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'BLOQUÉ' },
      { label: 'Abonnements payés actifs', value: paid, proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'BLOQUÉ' },
    ],
    trial: {
      days: integer(trial.jours_essai_plan),
      searches: integer(trial.recherches_essai),
      analyses: integer(trial.analyses_essai),
      onePerAccount: true,
      proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'BLOQUÉ',
    },
    gates,
    scorecard: SCORECARD,
    channels: {
      social: {
        state: snapshotResult.ok ? 'live' : 'blocked',
        published: integer(socialStatus.publie),
        toReview: integer(socialStatus.a_valider),
        rejected: integer(socialStatus.rejete),
        ignored: integer(socialStatus.ignore),
        byChannel: social.by_channel || {},
      },
      email: {
        state: 'verified_snapshot',
        campaign: 'AUTO — ArbitragePro — Prospection 3 emails (EN)',
        currentPlatform: 'Odoo SaaS',
        participants: 1104,
        ongoing: 407,
        finished: 697,
        e1Sent: 696,
        e2OpenedPct: 31,
        e2ClickedPct: 17,
        anomaly: 'E1 affiche 0 % d’ouverture malgré 683 succès : mesure à contrôler.',
        observedAt: '2026-09-08',
        vps: {
          platform: 'Odoo Community VPS',
          drafts: 3,
          sent: 0,
          reachable: Boolean(serviceResults.odoo?.reachable),
          state: 'ready_to_test',
          cutoverEligible: false,
          reason: 'Trois mailings ArbitragePro+ existent en brouillon, mais aucun envoi VPS n’est encore prouvé.',
        },
      },
      paid: { state: 'hold', budgetAuthorized: 0, reason: 'Aucune répétabilité payante démontrée.' },
    },
    internalEngines: {
      policy: 'Bascule seulement après un test de bout en bout réussi, mesure lisible, absence de P0/P1 et repli testé.',
      allOperational: false,
      services: [
        {
          id: 'automation',
          name: 'Automation Dyonysos',
          url: 'https://automation.dyonysos.fr',
          role: 'Ingestion et génération des contenus',
          reachable: Boolean(serviceResults.automation?.reachable),
          httpStatus: serviceResults.automation?.status || null,
          observed: 'Le flux [Deals Social] 05 a réussi plusieurs exécutions récentes dans Activepieces.',
          proof: 'OBSERVÉ',
          checkedAt: serviceResults.automation?.checkedAt || '2026-09-08T20:57:00.000Z',
          cutoverEligible: false,
          blocker: 'Les flux 01 à 04 sont désactivés ; seule l’étape ingestion/génération est prouvée.',
        },
        {
          id: 'odoo',
          name: 'Odoo Community VPS',
          url: 'https://odoo.dyonysos.fr',
          role: 'Mailing et suivi de campagne',
          reachable: Boolean(serviceResults.odoo?.reachable),
          httpStatus: serviceResults.odoo?.status || null,
          observed: 'Module E-mail Marketing installé ; 3 mailings ArbitragePro+ en brouillon, 0 envoyé.',
          proof: 'VÉRIFIÉ',
          checkedAt: serviceResults.odoo?.checkedAt || '2026-09-08T20:58:00.000Z',
          cutoverEligible: false,
          blocker: 'Délivrabilité VPS et remontée des ouvertures/clics non testées de bout en bout.',
        },
        {
          id: 'postiz',
          name: 'Postiz VPS',
          url: 'https://social.dyonysos.fr',
          role: 'Planification et publication sociale',
          reachable: Boolean(serviceResults.postiz?.reachable),
          httpStatus: serviceResults.postiz?.status || null,
          observed: `${integer(socialStatus.publie)} publications marquées publiées ; dernière publication observée par canal le 7 septembre.`,
          proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'À CONFIRMER',
          checkedAt: serviceResults.postiz?.checkedAt || live.captured_at || null,
          cutoverEligible: false,
          blocker: 'Un test contrôlé jusqu’au réseau cible et le repli doivent être validés avant de couper le moteur actuel.',
        },
      ],
      checklist: [
        { label: 'Trois interfaces internes joignables', done: Boolean(serviceResults.automation?.reachable && serviceResults.odoo?.reachable && serviceResults.postiz?.reachable) },
        { label: 'Parcours bout en bout sur un contenu témoin', done: false },
        { label: 'Délivrabilité / publication confirmée sur la destination', done: false },
        { label: 'Mesure, erreurs et alertes visibles', done: false },
        { label: 'Repli testé sans doublon ni envoi rétroactif', done: false },
      ],
    },
    competitors: COMPETITORS,
    projections: {
      warning: 'Ces chiffres sont des projections conditionnelles, pas des garanties de vente.',
      formula: 'visites qualifiées × inscription × activation × conversion payante',
      rows: projectionRows,
    },
    backlog: [
      { id: 'AP-01', action: 'Mesurer chaque étape visite → compte → activation → checkout → paiement', status: traffic ? 'en_cours' : 'a_faire', priority: 'P0', owner: 'Produit / Analytics', horizon: 'J+1', success: '5 étapes visibles avec source et horodatage' },
      { id: 'AP-02', action: 'Rattacher la preuve technique CAPTCHA/rate-limit au journal', status: 'a_verifier', priority: 'P0', owner: 'Technique', horizon: 'J+1', success: 'preuve serveur + test abus contrôlé' },
      { id: 'AP-03', action: 'Confirmer le régime TVA et l’immatriculation attendue dans Stripe', status: 'a_verifier', priority: 'P0', owner: 'Finance / Conseil', horizon: 'J+1', success: 'avis daté + configuration cohérente' },
      { id: 'AP-04', action: 'Faire parcourir l’essai à 10 vendeurs Amazon ciblés', status: 'pret', priority: 'P1', owner: 'Commercial', horizon: 'J+7', success: '≥ 5 activations et objections consignées' },
      { id: 'AP-05', action: 'Tester un mailing ArbitragePro+ Odoo VPS sur une liste interne contrôlée', status: 'a_verifier', priority: 'P1', owner: 'CRM', horizon: 'J+1', success: 'envoi, réception, clic et statistiques confirmés sans doublon' },
      { id: 'AP-06', action: 'Tester Activepieces → Postiz → réseau cible avec repli documenté', status: 'a_verifier', priority: 'P1', owner: 'Automation / Social', horizon: 'J+1', success: '1 contenu témoin publié une seule fois et journalisé' },
    ],
    truthLog: [
      { proof: 'VÉRIFIÉ', statement: 'Limites d’essai stockées en base : 7 jours, 30 recherches, 50 analyses.', at: live.captured_at || null },
      { proof: 'VÉRIFIÉ', statement: `${paid} abonnement payé actif dans la source métier.`, at: subscriptions.last_update || live.captured_at || null },
      { proof: 'VÉRIFIÉ', statement: `${integer(socialStatus.publie)} publications sociales marquées publiées et ${integer(socialStatus.a_valider)} à valider.`, at: live.captured_at || null },
      { proof: 'OBSERVÉ', statement: 'Stripe Tax actif et calcul de taxe complet sur le dernier checkout live observé.', at: '2026-09-08T20:48:00.000Z' },
      { proof: 'À CONFIRMER', statement: 'Aucune immatriculation fiscale Stripe trouvée au contrôle ; vérifier la cohérence avec le régime TVA réel.', at: '2026-09-08T20:48:00.000Z' },
      { proof: 'DÉCLARÉ', statement: 'Sandbox Stripe et protection CAPTCHA/rate-limit validés par la direction.', at: '2026-09-08T00:00:00.000Z' },
      { proof: 'PROJECTION', statement: 'Les objectifs J+1 à J+30 restent conditionnels faute d’historique de conversion payante.', at: now.toISOString() },
    ],
  };
}

async function getArbitragePilotage() {
  const [snapshot, traffic, services] = await Promise.all([
    readCommercialSnapshot(),
    readVercelTraffic(),
    readInternalServices(),
  ]);
  return buildDashboard(snapshot, traffic, new Date(), services);
}

module.exports = {
  buildDashboard,
  getArbitragePilotage,
  readCommercialSnapshot,
  readVercelTraffic,
  readInternalServices,
};
