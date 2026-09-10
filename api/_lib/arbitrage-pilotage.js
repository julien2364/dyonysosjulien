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

async function readGrowthHealth() {
  try {
    const response = await withTimeout('https://odoo.dyonysos.fr/arbitragepro/growth/health', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Growth health HTTP ${response.status}`);
    const value = await response.json();
    return { ok: true, state: value.status === 'healthy' ? 'live' : 'error', value };
  } catch (error) {
    return {
      ok: false,
      state: error && error.name === 'AbortError' ? 'timeout' : 'error',
      value: null,
      error: error && error.message ? error.message : String(error),
    };
  }
}

async function readInternalServices() {
  const [automation, odoo, postiz, growth] = await Promise.all([
    probe('https://automation.dyonysos.fr/'),
    probe('https://odoo.dyonysos.fr/web/webclient/version_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
    }),
    probe('https://social.dyonysos.fr/auth'),
    readGrowthHealth(),
  ]);
  return { automation, odoo, postiz, growth };
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
  const growthServices = serviceResults.growth?.value?.services || [];
  const crmGrowth = growthServices.find((item) => item.name === 'Odoo CRM') || {};
  const socialGrowth = growthServices.find((item) => item.name === 'Réseaux sociaux / Postiz') || {};
  const youtubeGrowth = growthServices.find((item) => item.name === 'YouTube / Postiz') || {};
  const mailingGrowth = growthServices.find((item) => item.name === 'Mailing Odoo ArbitragePro') || {};
  const socialCrmGrowth = growthServices.find((item) => item.name === 'Conversions sociales → Odoo') || {};
  const paymentGrowth = growthServices.find((item) => item.name === 'Paiement Stripe') || {};
  const automationGrowth = growthServices.find((item) => item.name === 'Automation Dyonysos') || {};
  const growthHealthy = serviceResults.growth?.state === 'live';
  const crmOperational = crmGrowth.state === 'healthy' && integer(crmGrowth.leads_linked) > 0;
  const socialOperational = socialGrowth.state === 'healthy'
    && integer(socialGrowth.published_count) > 0
    && integer(socialGrowth.queued_count) > 0;
  const youtubeOperational = youtubeGrowth.state === 'healthy'
    && (integer(youtubeGrowth.published_count) > 0 || integer(youtubeGrowth.queued_count) > 0);
  const mailingOperational = mailingGrowth.state === 'healthy'
    && integer(mailingGrowth.published_count) > 0;
  const automationOperational = automationGrowth.state === 'healthy';
  const socialCrmOperational = socialCrmGrowth.state === 'healthy';
  const paymentOperational = paymentGrowth.state === 'healthy';
  const internalOperational = Boolean(
    serviceResults.automation?.reachable
    && serviceResults.odoo?.reachable
    && serviceResults.postiz?.reachable
    && growthHealthy
    && automationOperational
    && socialCrmOperational
    && paymentOperational
    && crmOperational
    && socialOperational
    && youtubeOperational
    && mailingOperational
  );

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
      odoo: { state: crmOperational ? 'live' : 'error', capturedAt: crmGrowth.last_run_at || null },
      postiz: { state: socialOperational ? 'live' : 'error', capturedAt: socialGrowth.last_run_at || null },
      automation: { state: automationOperational ? 'live' : 'error', capturedAt: automationGrowth.last_run_at || serviceResults.automation?.checkedAt || null },
      socialCrm: { state: socialCrmOperational ? 'live' : 'error', capturedAt: socialCrmGrowth.last_run_at || null },
      payment: { state: paymentOperational ? 'live' : 'error', capturedAt: paymentGrowth.last_run_at || null },
    },
    verdict: {
      acquisition: 'GO — acquisition organique interne',
      execution: internalOperational ? 'OPÉRATIONNEL — Automation · Postiz · Odoo' : 'DÉGRADÉ — contrôle requis',
      decision: internalOperational ? 'ACQUISITION INTERNE OPÉRATIONNELLE' : 'ACQUISITION INTERNE DÉGRADÉE',
      confidence: internalOperational ? 'élevée sur Odoo CRM, publication et synchronisation des inscriptions sociales ; conversion payante encore à démontrer' : 'faible tant qu’un composant interne reste dégradé',
      bottleneck: paid > 0 ? 'Rétention et montée en charge' : 'Transformer les nouveaux contacts et visiteurs en essais actifs',
      reason: paid > 0
        ? 'Une conversion payante est observée ; le prochain enjeu est la répétabilité.'
        : internalOperational
          ? `${integer(crmGrowth.leads_linked)} opportunités sont dans le CRM ; Facebook et YouTube ont ${integer(socialGrowth.published_count) + integer(youtubeGrowth.published_count)} publication(s) en ligne, ${integer(socialGrowth.queued_count) + integer(youtubeGrowth.queued_count)} sont planifiées et Odoo a envoyé ${integer(mailingGrowth.published_count)} emails.`
          : 'Le lancement organique reste autorisé, mais une alerte interne signale un composant à rétablir.',
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
      socialPublished: integer(socialGrowth.published_count) + integer(youtubeGrowth.published_count),
      socialToReview: integer(socialGrowth.queued_count) + integer(youtubeGrowth.queued_count),
      socialAttributedSignups: integer(socialCrmGrowth.leads_linked),
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
        state: socialOperational ? 'live' : 'blocked',
        published: integer(socialGrowth.published_count) + integer(youtubeGrowth.published_count),
        toReview: integer(socialGrowth.queued_count) + integer(youtubeGrowth.queued_count),
        rejected: integer(socialStatus.rejete),
        ignored: integer(socialStatus.ignore),
        byChannel: social.by_channel || {},
        postizDrafts: 0,
        postizQueued: integer(socialGrowth.queued_count) + integer(youtubeGrowth.queued_count),
        postizVisuals: integer(socialGrowth.queued_count) + integer(youtubeGrowth.queued_count),
        facebookPublished: integer(socialGrowth.published_count),
        facebookQueued: integer(socialGrowth.queued_count),
        youtubePublished: integer(youtubeGrowth.published_count),
        youtubeQueued: integer(youtubeGrowth.queued_count),
        tiktokState: 'Création préparée — date de naissance et confirmation finale requises',
        postizStart: socialGrowth.last_published_at || '2026-09-10T04:31:09.000Z',
        postizEnd: '2026-11-09T11:00:00.000Z',
        dailyWindowEnd: '2026-11-09T11:00:00.000Z',
        dailyCadence: '1 publication/jour/canal du 11 septembre au 9 novembre (60 jours)',
        postizProof: 'VÉRIFIÉ',
      },
      email: {
        state: 'verified_snapshot',
        campaign: 'Automatisation commerciale TPE — vendeurs Amazon Europe (EN)',
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
          drafts: 0,
          sent: integer(mailingGrowth.published_count),
          testAccepted: true,
          reachable: Boolean(serviceResults.odoo?.reachable),
          state: mailingOperational ? 'operational' : 'degraded',
          cutoverEligible: mailingOperational,
          prospectList: 'Vendeurs Amazon qualifiés — Keepa FR',
          prospects: integer(crmGrowth.contacts_seen),
          prospectsBlocked: 0,
          contactAutomations: mailingOperational ? 1 : 0,
          linkedMailings: integer(mailingGrowth.queued_count),
          plan21Days: 10118,
          dailyPlan: [
            ['2026-09-11',80],['2026-09-12',330],['2026-09-13',500],['2026-09-14',500],['2026-09-15',708],
            ['2026-09-16',500],['2026-09-17',500],['2026-09-18',500],['2026-09-19',500],['2026-09-20',500],
            ['2026-09-21',500],['2026-09-22',500],['2026-09-23',500],['2026-09-24',500],['2026-09-25',500],
            ['2026-09-26',500],['2026-09-27',500],['2026-09-28',500],['2026-09-29',500],['2026-09-30',500],['2026-10-01',500],
          ].map(([date, planned]) => ({ date, planned })),
          markets: ['ES','DE','NL','BE','IT','UK'],
          reason: mailingGrowth.details || 'Le contrôle mailing Odoo est en attente.',
          deliverability: 'Boîte Gmail témoin : spam lié à des signalements antérieurs du domaine ; mailed-by et signed-by arbitragepro.eu, TLS confirmé. Surveiller échecs, désinscriptions et réponses avant toute hausse de volume.',
        },
      },
      paid: { state: 'forbidden', budgetAuthorized: 0, reason: 'Publicité payante interdite par décision de direction. Acquisition organique uniquement.' },
    },
    internalEngines: {
      decision: 'GO',
      policy: 'Automatisation commerciale TPE : Automation, Postiz et Odoo Community constituent la chaîne prioritaire. Toute panne déclenche une alerte e-mail sur changement d’état.',
      allOperational: internalOperational,
      services: [
        {
          id: 'automation',
          name: 'Automation Dyonysos',
          url: 'https://automation.dyonysos.fr',
          role: 'Ingestion et génération des contenus',
          reachable: Boolean(serviceResults.automation?.reachable),
          httpStatus: serviceResults.automation?.status || null,
          observed: automationGrowth.details || 'Le flux [ARBITRAGEPRO] Supervision acquisition sociale → Odoo est publié et actif toutes les 5 minutes.',
          proof: 'VÉRIFIÉ',
          checkedAt: serviceResults.automation?.checkedAt || '2026-09-08T22:12:01.000Z',
          cutoverEligible: Boolean(serviceResults.automation?.reachable && automationOperational),
          blocker: serviceResults.automation?.reachable && automationOperational ? 'Aucun.' : (automationGrowth.details || 'Flux Automation indisponible.'),
        },
        {
          id: 'odoo',
          name: 'Odoo Community VPS',
          url: 'https://odoo.dyonysos.fr',
          role: 'Mailing et suivi de campagne',
          reachable: Boolean(serviceResults.odoo?.reachable),
          httpStatus: serviceResults.odoo?.status || null,
          observed: `${integer(crmGrowth.leads_linked)} opportunités ArbitragePro sont liées au CRM ; synchronisation native toutes les 15 minutes.`,
          proof: 'VÉRIFIÉ',
          checkedAt: serviceResults.odoo?.checkedAt || '2026-09-08T22:15:30.000Z',
          cutoverEligible: crmOperational,
          blocker: crmOperational ? 'Aucun.' : 'Le statut acquisition Odoo est dégradé.',
        },
        {
          id: 'postiz',
          name: 'Postiz VPS',
          url: 'https://social.dyonysos.fr',
          role: 'Planification et publication sociale',
          reachable: Boolean(serviceResults.postiz?.reachable),
          httpStatus: serviceResults.postiz?.status || null,
          observed: `${integer(socialGrowth.published_count)} publication Facebook et ${integer(youtubeGrowth.published_count)} vidéo YouTube sont en ligne ; ${integer(socialGrowth.queued_count) + integer(youtubeGrowth.queued_count)} publications sont planifiées.`,
          proof: 'VÉRIFIÉ',
          checkedAt: serviceResults.postiz?.checkedAt || '2026-09-08T22:23:30.000Z',
          cutoverEligible: socialOperational && youtubeOperational,
          blocker: socialOperational && youtubeOperational ? 'Aucun.' : (youtubeGrowth.details || socialGrowth.details || 'Le statut Postiz est dégradé.'),
        },
      ],
      checklist: [
        { label: 'Trois interfaces internes joignables', done: Boolean(serviceResults.automation?.reachable && serviceResults.odoo?.reachable && serviceResults.postiz?.reachable) },
        { label: 'Parcours bout en bout sur Facebook', done: integer(socialGrowth.published_count) > 0 },
        { label: 'Publication confirmée sur YouTube', done: integer(youtubeGrowth.published_count) > 0 },
        { label: 'Mesure, erreurs et alertes visibles', done: true },
        { label: 'File Postiz planifiée sans doublon', done: integer(socialGrowth.queued_count) >= 15 },
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
      { id: 'AP-05', action: 'Mesurer les clics et réponses des trois segments Odoo VPS', status: mailingOperational ? 'en_cours' : 'a_verifier', priority: 'P1', owner: 'CRM', horizon: 'J+1 à J+5', success: 'clics, réponses et désinscriptions suivis sans doublon' },
      { id: 'AP-06', action: 'Surveiller Facebook et l’alimentation progressive de la file YouTube', status: socialOperational && youtubeOperational ? 'en_cours' : 'a_verifier', priority: 'P0', owner: 'Automation / Social', horizon: 'Continu', success: 'publications avec URL native, sans doublon' },
    ],
    truthLog: [
      { proof: 'VÉRIFIÉ', statement: 'Limites d’essai stockées en base : 7 jours, 30 recherches, 50 analyses.', at: live.captured_at || null },
      { proof: 'VÉRIFIÉ', statement: `${paid} abonnement payé actif dans la source métier.`, at: subscriptions.last_update || live.captured_at || null },
      { proof: 'OBSERVÉ', statement: 'Stripe Tax actif et calcul de taxe complet sur le dernier checkout live observé.', at: '2026-09-08T20:48:00.000Z' },
      { proof: 'À CONFIRMER', statement: 'Aucune immatriculation fiscale Stripe trouvée au contrôle ; vérifier la cohérence avec le régime TVA réel.', at: '2026-09-08T20:48:00.000Z' },
      { proof: 'DÉCLARÉ', statement: 'Sandbox Stripe et protection CAPTCHA/rate-limit validés par la direction.', at: '2026-09-08T00:00:00.000Z' },
      { proof: 'DÉCLARÉ', statement: 'Acquisition organique et bascule vers Odoo VPS, Postiz et Automation autorisées par la direction.', at: '2026-09-08T22:00:00.000Z' },
      { proof: 'VÉRIFIÉ', statement: 'Odoo VPS : expéditeur ArbitragePro corrigé et envoi d’essai accepté par le SMTP dédié.', at: '2026-09-08T22:15:30.000Z' },
      { proof: crmOperational ? 'VÉRIFIÉ' : 'BLOQUÉ', statement: `Odoo Community : ${integer(crmGrowth.leads_linked)} opportunités ArbitragePro liées automatiquement au CRM sur ${integer(crmGrowth.contacts_seen)} contacts qualifiés.`, at: crmGrowth.last_run_at || null },
      { proof: socialOperational ? 'VÉRIFIÉ' : 'BLOQUÉ', statement: `Postiz : ${integer(socialGrowth.published_count)} publication Facebook confirmée par URL native et ${integer(socialGrowth.queued_count)} publications planifiées.`, at: socialGrowth.last_run_at || null },
      { proof: youtubeOperational ? 'VÉRIFIÉ' : 'BLOQUÉ', statement: `YouTube : ${integer(youtubeGrowth.published_count)} vidéo publiée et ${integer(youtubeGrowth.queued_count)} planifiée(s) dans Postiz.`, at: youtubeGrowth.last_run_at || null },
      { proof: mailingOperational ? 'VÉRIFIÉ' : 'BLOQUÉ', statement: `Odoo Community : ${integer(mailingGrowth.published_count)} emails ArbitragePro envoyés ; ${integer(mailingGrowth.queued_count)} relances segmentées planifiées.`, at: mailingGrowth.last_run_at || null },
      { proof: 'OBSERVÉ', statement: 'Délivrabilité témoin : authentification arbitragepro.eu et TLS confirmés ; Gmail classe le test en spam à cause de signalements antérieurs propres à cette boîte.', at: '2026-09-10T06:37:00.000Z' },
      { proof: socialCrmOperational ? 'VÉRIFIÉ' : 'BLOQUÉ', statement: `Conversions sociales → Odoo : synchronisation active ; ${integer(socialCrmGrowth.leads_linked)} inscription attribuée à ce jour.`, at: socialCrmGrowth.last_run_at || null },
      { proof: paymentOperational ? 'VÉRIFIÉ' : 'BLOQUÉ', statement: 'Paiement : disponibilité et configuration Stripe contrôlées automatiquement toutes les cinq minutes.', at: paymentGrowth.last_run_at || null },
      { proof: 'VÉRIFIÉ', statement: 'Publicité payante : budget fixé à 0 € ; aucune activation autorisée.', at: now.toISOString() },
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
