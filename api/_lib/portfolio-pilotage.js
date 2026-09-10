const { getSelectedProjectTraffic } = require('./vercel-analytics');

const FETCH_TIMEOUT_MS = 8000;

const PROJECTS = [
  {
    slug: 'agoeon', name: 'Agoeon', url: 'https://www.agoeon.com',
    expectedMarker: 'Agoeon',
    github: 'julien2364/remake-patreon-082026', vercelProjectId: 'prj_1SY0dtoQNJWuUKynv9Wvm12z8iaX',
    state: 'Production publique · compte Stripe distinct créé, onboarding incomplet · mailing Odoo en file', commercialGate: 'Débloquer l’envoi, puis mesurer réponse → créateur actif → paiement',
    cashEvidence: 'Aucun encaissement attribué prouvé dans le cockpit.',
    observedAt: '2026-09-10',
    funnel: {
      acquisition: '3 661 contacts ciblés ; mailing marqué envoyé mais 0 e-mail envoyé et 755 en file.',
      activation: '2 fiches créateur reliées à des IDs auth ; connexion externe active non prouvée.',
      payment: '3 paliers sur @ania. Un compte Stripe Agoeon distinct a été créé le 10/09, mais activation/KYC et paiement live restent incomplets ; 0 paiement attribué.',
      cash: '0 € prouvé.',
      firstGap: 'Distribution e-mail : la campagne n’a encore envoyé aucun message.',
      decision: 'Ne pas élargir la cible. Terminer l’onboarding Stripe sans compter de revenu, puis résoudre la file/SMTP, dédupliquer et filtrer les adresses invalides avant reprise.',
    },
    channels: 'Tunnel /commencer déployé et mesure des étapes présente. 17 099 profils restent à classifier, pas à contacter. Odoo : 0 envoyé et 755 traces en file. Social : deux exécutions Activepieces ont échoué ; 0 publication native prouvée.',
    monitoring: 'Audit de production relancé le 10/09. Alerte email panne/paiement et déduplication restent INCONNUES ; aucune autonomie d’alerte ne doit être revendiquée.',
    autonomy: 'NON AUTONOME : file Odoo, automatisation sociale, expérience créateur et Stripe live demandent encore une résolution ; KYC restera humain.',
    brand: 'Email marketing avec logo, visuel, signature approuvée, photo, téléphone et LinkedIn : NON PROUVÉ. Publication sociale native avec visuel : 0.',
  },
  {
    slug: 'linktrib', name: 'Linktrib', url: 'https://www.linktrib.com',
    expectedMarker: 'Linktrib',
    github: 'julien2364/Kreo', vercelProjectId: 'prj_bpLOwVJ6fPB7zi1MObQWWt4IfLIg',
    state: 'Production publique · automation Odoo en cours', commercialGate: 'Transformer clics/réponses en créateurs actifs puis en paiements',
    cashEvidence: 'Aucun encaissement attribué prouvé dans le cockpit.',
    observedAt: '2026-09-10',
    funnel: {
      acquisition: '1 057 participants ; 656 e-mails envoyés ; 18 % ouverts ; 1 % cliqués ; 0 % répondu. Odoo affiche 25 clics agrégés.',
      activation: 'Aucun créateur réel actif attribué à cette campagne.',
      payment: 'Checkout observé en mode démo ; 0 commande ou abonnement attribué.',
      cash: '0 € prouvé.',
      firstGap: 'Ouverture/clic → réponse qualifiée : la campagne diffuse mais ne produit pas encore de conversation commerciale.',
      decision: 'Geler l’élargissement, qualifier les clics et tester une seule proposition/landing avec attribution complète.',
    },
    channels: 'Odoo : 656 e-mails envoyés et 25 clics agrégés. Postiz : 3 contenus YouTube en file. Make YouTube reste DÉGRADÉ après deux erreurs reçues le 10/09.',
    monitoring: 'Worker déterministe corrigé et déployé : 2 confirmations, 600 s de stabilité, empreinte persistante, rappel 24 h. Deux contrôles post-déploiement n’ont créé aucun nouvel e-mail ; preuve d’un incident futur encore à observer.',
    autonomy: 'PARTIELLE : worker sans IA opérationnel ; Make YouTube dégradé et paiement non prêt. Aucun cash attribué.',
    brand: 'Qualité native des 3 contenus YouTube en file non vérifiée. Template marketing complet et signature approuvée de Julien : NON PROUVÉS.',
  },
  {
    slug: 'odoo-apps', name: 'Odoo Apps', url: 'https://www.dyonysos.fr/applications-odoo',
    expectedMarker: 'Applications Odoo',
    github: '4 dépôts publics Dyonysos', vercelProjectId: 'prj_9GUpX7bWsEM6JFXXOKMgf6dwE4EQ',
    analyticsScope: 'Trafic du site Dyonysos global, pas des seules pages Odoo',
    state: '32 apps et 39 thèmes Store observés', commercialGate: 'Vues Store → panier → paiement → payout',
    cashEvidence: 'Ventes et payouts actuels non prouvés.', dedicatedPath: '/pilotage-odoo',
    observedAt: '2026-09-09',
    funnel: {
      acquisition: '32 apps et 39 thèmes publiés ; trafic Store par fiche non exposé dans ce cockpit.',
      activation: 'Au moins 5 téléchargements cumulés visibles sur les 3 socles gratuits contrôlés.',
      payment: 'Des offres payantes et Add to Cart existent ; commandes payées non prouvées.',
      cash: 'Payout Store non prouvé.',
      firstGap: 'Mesure Store payante : vues, paniers, commandes et payout ne sont pas réconciliés.',
      decision: 'Instrumenter 2–3 offres Pareto avant de produire davantage ; conserver les gratuites comme acquisition.',
    },
  },
  {
    slug: 'etsy', name: 'Etsy · PetStoneOriginal', url: 'https://www.etsy.com/shop/PetStoneOriginal',
    expectedMarker: 'PetStoneOriginal',
    github: null, vercelProjectId: null, sitemapUrl: null,
    state: 'Boutique active · 150 fiches',
    commercialGate: 'Visite → commande rentable → solde positif → virement',
    cashEvidence: '121 visites / 7 j, 0 commande, 0 € de CA ; solde Etsy −32,65 €.',
    observedAt: '2026-09-09',
    snapshot: { visits7d: 121, views7d: 171, orders7d: 0, revenue7d: 0, activeListings: 150, listingsWithVideo: 149, historicalSales: 9, balanceEur: -32.65, listingAndOtherFeesMonthEur: -31.45, marketingMonthEur: -0.77, amountDueEur: 0.43, paymentCardStatus: 'failed', observedAt: '2026-09-10', source: 'Etsy Shop Manager et Etsy Payments authentifiés' },
    funnel: {
      acquisition: '171 vues et 121 visites sur 7 jours ; 150 fiches actives, dont 149 avec vidéo.',
      activation: '0 commande sur 7 jours ; 9 ventes historiques au total.',
      payment: '0 € de ventes en septembre ; carte de débit signalée en échec.',
      cash: 'Solde −32,65 € ; 0 € disponible au virement ; 0,43 € dû le 15/09.',
      firstGap: 'Visite → commande : le trafic existe mais ne convertit pas et les frais rendent le canal négatif.',
      decision: 'Aucune hausse publicitaire. Auditer les 10 fiches les plus vues et la marge ; demander validation avant toute désactivation de publicité.',
    },
  },
  {
    slug: 'arbitragepro', name: 'ArbitragePro+', url: 'https://www.arbitragepro.eu',
    expectedMarker: 'ArbitragePro',
    github: 'julien2364/Arbitrage', vercelProjectId: 'prj_YNDpcwcBx3TfwNUF3TFDpTF6U8YJ',
    state: 'Production publique', commercialGate: 'Paiement live → webhook → accès → cash',
    cashEvidence: 'Aucun paiement attribué prouvé.', dedicatedPath: '/pilotage-arbitragepro',
    observedAt: '2026-09-09',
    funnel: {
      acquisition: '3 386 sessions et 4 inscriptions dans le dernier snapshot interne ; 1 recherche.',
      activation: 'Entrée Starter à 71 €/mois accessible après connexion.',
      payment: 'Stripe live : 0 PaymentIntent ; 1 session Checkout expirée, impayée et à 0 €.',
      cash: 'Solde Stripe live disponible 0 € ; pending 0 €.',
      firstGap: 'Checkout → paiement : aucune tentative payante attribuée.',
      decision: 'Tester une seule offre Starter bout en bout avec montant réel, webhook et droit activé, sans publicité.',
    },
    channels: 'Odoo CRM : 376 contacts qualifiés liés au pipeline. Postiz : 1 publication native et 15 contenus en file. Publicité payante : 0 € et interdite.',
    monitoring: 'Endpoint public growth/health = healthy à 04:53 UTC ; Automation, Odoo CRM et Postiz sont lus sans IA. Alerte paiement échoué non encore prouvée.',
    autonomy: 'OPÉRATIONNELLE pour l’acquisition organique interne ; PARTIELLE commercialement car paiement, webhook, droit et cash restent non prouvés bout en bout.',
    brand: '16 contenus avec visuel sont rapportés par le cockpit dédié ; 1 URL de publication native est comptée. Template marketing et signature approuvée restent à contrôler.',
  },
  {
    slug: 'propecto', name: 'Propecto', url: 'https://www.propecto.eu',
    expectedMarker: 'Propecto',
    github: 'julien2364/annuaire', vercelProjectId: 'prj_iTUKEu3BUVEGJpxm9nS0Km7vjIUs',
    state: 'Production publique', commercialGate: 'Offre publique → checkout → paiement',
    cashEvidence: 'Aucun encaissement attribué prouvé dans ce cockpit.',
    observedAt: '2026-09-09',
    funnel: {
      acquisition: 'Trafic SEO observé ; production publique joignable.',
      activation: 'Consultation d’annuaire/fiches disponible ; activation commerciale non réconciliée.',
      payment: 'Compte Stripe Dyonysos live : 0 PaymentIntent et 0 session Checkout observés.',
      cash: 'Solde Stripe live disponible 0 € ; pending 0 €.',
      firstGap: 'Offre → Checkout : aucun trafic de paiement live observé.',
      decision: 'Prouver un chemin public vers une seule offre et un Checkout live avant toute acquisition supplémentaire.',
    },
    channels: 'SEO et production publique observés ; branchement d’événements de production et canal social en cours de vérification. Aucun envoi de masse autorisé pendant l’audit.',
    monitoring: 'Branchement acquisition/checkout/paiement codé le 10/09 ; validation complète et déploiement attendent encore la preuve finale de la tâche Propecto.',
    autonomy: 'EN COURS : moniteur déterministe prévu ; absence de trafic doit rester distincte d’une panne réelle.',
    brand: 'Brouillon/test social prévu sans publication réelle. Template marketing, logo, capture produit et signature approuvée : NON PROUVÉS.',
  },
  {
    slug: 'cvdesignpro', name: 'CVDesignPro', url: 'https://www.cvdesignpro.com/fr',
    expectedMarker: 'CVDesignPro',
    github: 'julien2364/cvdesignpro', vercelProjectId: 'prj_sbz1BpKKEmUMe1qLASFYIFahRxKA',
    state: 'Production publique', commercialGate: 'Démarrage → checkout → abonnement',
    cashEvidence: 'Le cockpit dédié lit les métriques internes ; cash attribué non exposé ici.',
    observedAt: '2026-09-10',
    funnel: {
      acquisition: 'Relais Odoo : 15/15 traces envoyées, réception individuelle non prouvée. Recruteurs : 9 079 mails planifiés dès le 11/09, plafond 150/jour ouvré. Social : 84 planifiés, 0 publication native du nouveau moteur.',
      activation: '0 activation recruteur attribuée.',
      payment: 'Checkout sondé : POST non authentifié = 401 attendu. 0 paiement candidat ; aucun achat live bout en bout rejoué.',
      cash: '0 € attribué prouvé dans ce cockpit.',
      firstGap: 'Démarrage → activation/checkout : aucun événement commercial attribué.',
      decision: 'Conserver le monitoring technique, puis observer un vrai parcours externe avant toute amplification.',
    },
    channels: 'Email relais Odoo OPÉRATIONNEL côté émission : 15/15, 0 échec. Email recruteurs CONFIGURÉ : 9 079 en file, 150/jour. Social CONFIGURÉ : 84 planifiés, 0 ID natif du nouveau moteur.',
    monitoring: 'Watchdog VPS déterministe actif toutes les 10 min ; empreinte SHA-256, changement d’état, rappel 24 h et rétablissement. Santé publique sanitisée ; sondes techniques vertes, 0 vente.',
    autonomy: 'PARTIELLE : sondes et alertes sans IA ; acquisition, activation et paiement externes ne sont pas encore autonomes ni prouvés.',
    brand: 'Orchestrateur social présent, mais preuve native du visuel/vidéo et absence de doublon encore manquantes. Template marketing complet avec signature approuvée : NON PROUVÉ.',
  },
  {
    slug: 'ecole-connect', name: 'École Connect', url: 'https://ecole-connect-dyonysos.vercel.app',
    expectedMarker: 'École Connect',
    github: 'julien2364/ecole-connect', vercelProjectId: 'prj_6t8rABLHNlvQb0sUMb0gT55P50E7',
    state: 'Production publique, non monétisée', commercialGate: 'Offre payante et checkout absents',
    cashEvidence: '0 € attendu tant que la monétisation n’est pas définie.',
  },
  {
    slug: 'courshub', name: 'CoursHub', url: 'https://coursehub-dyonysos.vercel.app',
    expectedMarker: 'CoursHub',
    github: 'julien2364/Coursehub', vercelProjectId: null,
    state: 'Production publique, non monétisée', commercialGate: 'Offre payante et checkout absents',
    cashEvidence: '0 € attendu tant que la monétisation n’est pas définie.',
  },
  {
    slug: 'quizplay', name: 'QuizPlay', url: 'https://quizplay-production.up.railway.app/',
    expectedMarker: 'QuizPlay',
    github: null, vercelProjectId: null,
    state: 'Production publique, non monétisée', commercialGate: 'Offre payante et checkout absents',
    cashEvidence: '0 € attendu tant que la monétisation n’est pas définie.',
  },
];

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(url, { ...options, redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': 'Dyonysos-private-pilotage/1.0', ...(options.headers || {}) } });
    return { response, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

async function probe(project) {
  try {
    const { response, latencyMs } = await fetchWithTimeout(project.url, { method: 'GET' });
    const expectedHost = new URL(project.url).hostname.replace(/^www\./, '');
    const finalHost = new URL(response.url).hostname.replace(/^www\./, '');
    const hostMatches = expectedHost === finalHost;
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    const body = response.ok && contentType.includes('text/html') ? await response.text() : '';
    const markerMatched = Boolean(project.expectedMarker && body.toLowerCase().includes(project.expectedMarker.toLowerCase()));
    return {
      ok: response.ok && hostMatches,
      verified: response.ok && hostMatches && markerMatched,
      status: response.status,
      finalUrl: response.url,
      finalHost,
      hostMatches,
      contentType,
      markerMatched,
      latencyMs,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return { ok: false, verified: false, status: null, error: error.message || String(error), checkedAt: new Date().toISOString() };
  }
}

async function readSitemap(project) {
  const sitemapUrl = Object.prototype.hasOwnProperty.call(project, 'sitemapUrl') ? project.sitemapUrl : `${project.url.replace(/\/$/, '')}/sitemap.xml`;
  if (!sitemapUrl) return { configured: false, reason: 'Aucun sitemap public applicable.' };
  try {
    const { response, latencyMs } = await fetchWithTimeout(sitemapUrl, { method: 'GET' });
    const text = await response.text();
    const expectedHost = new URL(sitemapUrl).hostname.replace(/^www\./, '');
    const finalHost = new URL(response.url).hostname.replace(/^www\./, '');
    const hostMatches = expectedHost === finalHost;
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    const xmlContentType = contentType.includes('xml');
    const rootMatch = text.match(/^\s*(?:<\?xml[^>]*>\s*)?<(urlset|sitemapindex)\b/i);
    const xmlRoot = rootMatch ? rootMatch[1].toLowerCase() : null;
    const locCount = (text.match(/<loc(?:\s[^>]*)?>/gi) || []).length;
    const lastmods = [...text.matchAll(/<lastmod(?:\s[^>]*)?>([^<]+)<\/lastmod>/gi)].map((match) => match[1]).sort();
    const ok = response.ok && hostMatches && xmlContentType && Boolean(xmlRoot) && locCount > 0;
    const reason = ok ? null : !response.ok ? `HTTP ${response.status}` : !hostMatches ? 'Redirection vers un autre domaine' : !xmlContentType ? `Type MIME non XML (${contentType || 'absent'})` : !xmlRoot ? 'Racine XML urlset/sitemapindex absente' : 'Sitemap XML vide';
    return { configured: true, ok, httpOk: response.ok, status: response.status, url: response.url, entries: locCount, latestLastmod: lastmods.at(-1) || null, hostMatches, contentType, xmlRoot, reason, latencyMs, checkedAt: new Date().toISOString() };
  } catch (error) {
    return { configured: true, ok: false, url: sitemapUrl, error: error.message || String(error), checkedAt: new Date().toISOString() };
  }
}

async function getPortfolioPilotage() {
  const analyticsDefinitions = PROJECTS.filter((project) => project.vercelProjectId).map((project) => ({ name: project.name, vercelProjectId: project.vercelProjectId }));
  const [analytics, healthRows, sitemapRows] = await Promise.all([
    getSelectedProjectTraffic(analyticsDefinitions),
    Promise.all(PROJECTS.map(probe)),
    Promise.all(PROJECTS.map(readSitemap)),
  ]);
  const analyticsById = Object.fromEntries((analytics.rows || []).map((row) => [row.vercelProjectId, row]));
  return {
    generatedAt: new Date().toISOString(),
    sources: {
      vercelAnalytics: { state: analytics.sourceState, configured: analytics.configured, capturedAt: analytics.capturedAt },
      googleAnalytics: { state: 'not_configured', note: 'Aucun identifiant de propriété GA4 n’est configuré dans le projet Dyonysos. Ne pas confondre avec Vercel Web Analytics.' },
      odoo: { state: 'dedicated_dashboard', path: '/pilotage-odoo', note: 'Catalogue public et historique Google Sheets dans le cockpit Odoo dédié.' },
      etsy: { state: 'authenticated_snapshot', note: 'Instantané manuel issu d’une session Etsy authentifiée le 10/09 ; aucune API Etsy/OAuth n’est configurée.' },
    },
    projects: PROJECTS.map((project, index) => ({
      ...project,
      health: healthRows[index],
      sitemap: sitemapRows[index],
      analytics: project.vercelProjectId ? analyticsById[project.vercelProjectId] || null : null,
    })),
  };
}

module.exports = { PROJECTS, getPortfolioPilotage };
