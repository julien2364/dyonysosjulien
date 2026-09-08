const ARBITRAGE_PROJECT_ID = 'prj_YNDpcwcBx3TfwNUF3TFDpTF6U8YJ';
const VERCEL_TEAM_ID = 'team_V2XarT2PcWGD86aDLfpoA5xa';
const REQUEST_TIMEOUT_MS = 8000;
const VERIFIED_TRIAL_SNAPSHOT = {
  jours_essai_plan: 7,
  recherches_essai: 30,
  analyses_essai: 50,
  capturedAt: '2026-09-08T22:48:00.000Z',
};

const COMPETITORS = [
  {
    name: 'Tactical Arbitrage',
    role: 'Concurrent direct',
    trial: '14 jours (7 jours + 7 après connexion vendeur)',
    price: 'Seller 365 dès $69/mois ($65/mois annuel)',
    signal: 'Sourcing intégré : plus de 1 400 détaillants, recherches simultanées et planifiées.',
    source: 'https://www.threecolts.com/seller-365',
    proof: 'VÉRIFIÉ',
    checkedAt: '2026-09-09',
  },
  {
    name: 'SourceMogul',
    role: 'Concurrent direct',
    trial: '7 jours, sans carte, accès complet',
    price: '£79.99/mois',
    signal: 'Essai très proche, mais sans quota public annoncé.',
    source: 'https://www.sourcemogul.com/pricing',
    proof: 'VÉRIFIÉ',
    checkedAt: '2026-09-08',
  },
  {
    name: 'SellerAmp',
    role: 'Outil d’analyse comparable — pas concurrent direct',
    trial: '14 jours',
    price: 'à partir de $19.95/mois',
    signal: 'Analyse produit, profit, ROI et historique ; repère fonctionnel pour Analyzer+.',
    source: 'https://selleramp.com/pricing/',
    proof: 'VÉRIFIÉ',
    checkedAt: '2026-09-08',
  },
  {
    name: 'Actorio',
    role: 'Concurrent direct',
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
  const trial = snapshotResult.ok ? (live.trial || {}) : VERIFIED_TRIAL_SNAPSHOT;
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
      proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'VÉRIFIÉ · INSTANTANÉ',
      detail: `${integer(trial.jours_essai_plan)} jours · ${integer(trial.recherches_essai)} recherches · ${integer(trial.analyses_essai)} analyses`,
      observedAt: live.captured_at || trial.capturedAt || null,
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
      odoo: { state: 'verified_snapshot', capturedAt: '2026-09-08T22:18:02.000Z' },
      postiz: { state: 'verified_snapshot', capturedAt: '2026-09-08T22:23:30.000Z' },
    },
    verdict: {
      acquisition: 'HOLD — aucune acquisition payante',
      execution: 'GO CONTRÔLÉ — maintien du repli Make',
      decision: 'HOLD PAYANT · PRODUIT ET ORGANIQUE SOUS CONTRÔLE',
      confidence: 'élevée sur le tunnel et le transport Odoo, faible sur la conversion payante et Postiz Facebook',
      bottleneck: paid > 0 ? 'Rétention produit' : 'Activation organique + reconnexion Facebook Postiz',
      reason: paid > 0
        ? 'Une conversion payante est observée ; le prochain enjeu est la répétabilité.'
        : 'Aucune acquisition payante n’est autorisée ni lancée. Un témoin Odoo VPS est reçu mais classé en indésirables ; Facebook exige une reconnexion dans Postiz.',
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
      proof: snapshotResult.ok ? 'VÉRIFIÉ' : 'VÉRIFIÉ · INSTANTANÉ',
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
        postizDrafts: 16,
        postizVisuals: 5,
        postizStart: '2026-09-10T08:30:00.000Z',
        postizEnd: '2026-11-03T09:30:00.000Z',
        postizProof: 'VÉRIFIÉ',
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
          testAccepted: true,
          testReceived: true,
          deliveryPlacement: 'indésirables',
          trackingConfirmed: false,
          reachable: Boolean(serviceResults.odoo?.reachable),
          state: 'witness_received_in_spam',
          cutoverEligible: false,
          prospectList: 'QUARANTAINE — NE PAS UTILISER — vendeurs US/Europe',
          prospects: 9,
          prospectsBlocked: 9,
          contactAutomations: 0,
          linkedMailings: 0,
          reason: 'Un témoin est reçu dans Gmail, mais classé en indésirables. La liste de 9 contacts est privée, quarantinée, sans campagne liée et bloquée à 9/9.',
        },
      },
      paid: { state: 'hold', budgetAuthorized: 0, reason: 'HOLD explicite : aucune campagne payante, aucun budget et aucune dépense.' },
    },
    internalEngines: {
      decision: 'GO',
      policy: 'GO de direction enregistré. La coupure de Make reste conditionnée à une publication interne réussie et sans doublon.',
      allOperational: false,
      services: [
        {
          id: 'automation',
          name: 'Automation Dyonysos',
          url: 'https://automation.dyonysos.fr',
          role: 'Ingestion et génération des contenus',
          reachable: Boolean(serviceResults.automation?.reachable),
          httpStatus: serviceResults.automation?.status || null,
          observed: 'Le flux [Deals Social] 05 réussit toutes les 3 minutes ; les derniers passages n’ont généré aucun nouvel élément.',
          proof: 'VÉRIFIÉ',
          checkedAt: serviceResults.automation?.checkedAt || '2026-09-08T22:12:01.000Z',
          cutoverEligible: false,
          blocker: 'Aucun contenu frais n’a encore traversé ingestion → génération → publication.',
        },
        {
          id: 'odoo',
          name: 'Odoo Community VPS',
          url: 'https://odoo.dyonysos.fr',
          role: 'Mailing et suivi de campagne',
          reachable: Boolean(serviceResults.odoo?.reachable),
          httpStatus: serviceResults.odoo?.status || null,
          observed: 'Trois brouillons utilisent le SMTP ArbitragePro dédié. Un témoin est reçu dans Gmail mais classé en indésirables. La liste de 9 contacts est renommée QUARANTAINE — NE PAS UTILISER, privée, bloquée à 9/9, sans campagne ni automatisation contact.',
          proof: 'VÉRIFIÉ',
          checkedAt: serviceResults.odoo?.checkedAt || '2026-09-08T22:18:02.000Z',
          cutoverEligible: false,
          blocker: 'Corriger le classement en indésirables, puis confirmer clic et statistiques sur un lot interne contrôlé.',
        },
        {
          id: 'postiz',
          name: 'Postiz VPS',
          url: 'https://social.dyonysos.fr',
          role: 'Planification et publication sociale',
          reachable: Boolean(serviceResults.postiz?.reachable),
          httpStatus: serviceResults.postiz?.status || null,
          observed: 'API authentifiée et workers Temporal réparés. 16 brouillons avec visuel couvrent le 10 septembre au 3 novembre ; le post témoin a atteint Facebook puis a échoué sur un jeton invalidé.',
          proof: 'VÉRIFIÉ',
          checkedAt: serviceResults.postiz?.checkedAt || '2026-09-08T22:23:30.000Z',
          cutoverEligible: false,
          blocker: 'Reconnecter le compte Facebook ArbitragePro+ dans Postiz, puis rejouer un seul post témoin.',
        },
      ],
      checklist: [
        { label: 'Trois interfaces internes joignables', done: Boolean(serviceResults.automation?.reachable && serviceResults.odoo?.reachable && serviceResults.postiz?.reachable) },
        { label: 'Parcours bout en bout sur un contenu témoin', done: false },
        { label: 'Délivrabilité / publication confirmée sur la destination', done: false },
        { label: 'Mesure, erreurs et alertes visibles', done: true },
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
      { id: 'AP-04', action: 'Observer uniquement les inscriptions volontaires issues du site et de l’organique', status: 'hold', priority: 'P1', owner: 'Produit', horizon: 'J+7', success: 'activations volontaires mesurées, sans prospection chargée ni publicité' },
      { id: 'AP-05', action: 'Valider réception, clic et statistiques du premier lot Odoo VPS contrôlé', status: 'en_cours', priority: 'P1', owner: 'CRM', horizon: 'J+1', success: 'réception, clic et statistiques confirmés sans doublon' },
      { id: 'AP-06', action: 'Reconnecter Facebook dans Postiz, publier un témoin puis planifier les 16 brouillons', status: 'a_verifier', priority: 'P0', owner: 'Automation / Social', horizon: 'J+1', success: '1 témoin publié une seule fois, puis calendrier activé sans doublon' },
    ],
    truthLog: [
      { proof: 'VÉRIFIÉ', statement: 'Limites d’essai stockées en base : 7 jours, 30 recherches, 50 analyses.', at: live.captured_at || null },
      { proof: 'VÉRIFIÉ', statement: `${paid} abonnement payé actif dans la source métier.`, at: subscriptions.last_update || live.captured_at || null },
      { proof: 'VÉRIFIÉ', statement: `${integer(socialStatus.publie)} publications sociales marquées publiées et ${integer(socialStatus.a_valider)} à valider.`, at: live.captured_at || null },
      { proof: 'OBSERVÉ', statement: 'Stripe Tax actif et calcul de taxe complet sur le dernier checkout live observé.', at: '2026-09-08T20:48:00.000Z' },
      { proof: 'À CONFIRMER', statement: 'Aucune immatriculation fiscale Stripe trouvée au contrôle ; vérifier la cohérence avec le régime TVA réel.', at: '2026-09-08T20:48:00.000Z' },
      { proof: 'DÉCLARÉ', statement: 'Sandbox Stripe et protection CAPTCHA/rate-limit validés par la direction.', at: '2026-09-08T00:00:00.000Z' },
      { proof: 'DÉCISION', statement: 'Acquisition payante en HOLD : aucune campagne, aucun budget et aucune dépense autorisés.', at: '2026-09-09T00:00:00.000Z' },
      { proof: 'VÉRIFIÉ', statement: 'Odoo VPS : expéditeur ArbitragePro corrigé et envoi d’essai accepté par le SMTP dédié.', at: '2026-09-08T22:15:30.000Z' },
      { proof: 'VÉRIFIÉ', statement: 'Odoo VPS : un témoin est reçu dans Gmail, classé dans les indésirables ; la délivrabilité en boîte principale et le suivi des clics restent à valider.', at: '2026-09-08T22:18:02.000Z' },
      { proof: 'VÉRIFIÉ', statement: 'Odoo VPS : liste 11 renommée QUARANTAINE — NE PAS UTILISER ; privée, 9/9 bloqués, 0 campagne liée et aucun envoi à ces contacts.', at: '2026-09-08T23:43:55.000Z' },
      { proof: 'VÉRIFIÉ', statement: 'Postiz : workers Temporal réparés ; publication Facebook refusée car la session doit être reconnectée. Aucune URL publique créée.', at: '2026-09-08T22:23:30.000Z' },
      { proof: 'VÉRIFIÉ', statement: 'Postiz : 16 brouillons, 16 dates uniques et 5 visuels historiques chargés pour le 10 septembre au 3 novembre ; aucune programmation active avant reconnexion Facebook.', at: '2026-09-08T22:42:00.000Z' },
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
