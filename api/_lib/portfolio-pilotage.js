const { getSelectedProjectTraffic } = require('./vercel-analytics');

const FETCH_TIMEOUT_MS = 8000;

const PROJECTS = [
  {
    slug: 'agoeon', name: 'Agoeon', url: 'https://www.agoeon.com',
    github: 'julien2364/remake-patreon-082026', vercelProjectId: 'prj_1SY0dtoQNJWuUKynv9Wvm12z8iaX',
    state: 'Production publique', commercialGate: 'Créateurs actifs et paiements attribués à mesurer',
    cashEvidence: 'Aucun encaissement attribué prouvé dans le cockpit.',
  },
  {
    slug: 'linktrib', name: 'Linktrib', url: 'https://www.linktrib.com',
    github: 'julien2364/Kreo', vercelProjectId: 'prj_wMSAHpc5ISZm0H0QVkCfdsjkih92',
    state: 'Production publique', commercialGate: 'Acquisition, activation créateur et paiement à mesurer',
    cashEvidence: 'Aucun encaissement attribué prouvé dans le cockpit.',
  },
  {
    slug: 'odoo-apps', name: 'Odoo Apps', url: 'https://www.dyonysos.fr/applications-odoo',
    github: '4 dépôts publics Dyonysos', vercelProjectId: 'prj_9GUpX7bWsEM6JFXXOKMgf6dwE4EQ',
    analyticsScope: 'Trafic du site Dyonysos global, pas des seules pages Odoo',
    state: '29 apps et 39 thèmes Store observés', commercialGate: 'Vues Store → panier → paiement → payout',
    cashEvidence: 'Ventes et payouts actuels non prouvés.', dedicatedPath: '/pilotage-odoo',
  },
  {
    slug: 'etsy', name: 'Etsy · PetStoneOriginal', url: 'https://www.etsy.com/shop/PetStoneOriginal',
    github: null, vercelProjectId: null, sitemapUrl: null,
    state: 'Boutique déclarée active · accès public automatisé bloqué par Etsy',
    commercialGate: 'Export Etsy Payments et marge par fiche',
    cashEvidence: 'Snapshot déclaré : 114 visites / 7 j, 0 commande ; 9 ventes historiques non rapprochées.',
    snapshot: { visits7d: 114, orders7d: 0, revenue7d: 0, observedAt: '2026-09-08', source: 'Etsy Shop Manager observé par Julien/agent' },
  },
  {
    slug: 'arbitragepro', name: 'ArbitragePro+', url: 'https://www.arbitragepro.eu',
    github: 'julien2364/Arbitrage', vercelProjectId: 'prj_YNDpcwcBx3TfwNUF3TFDpTF6U8YJ',
    state: 'Production publique', commercialGate: 'Paiement live → webhook → accès → cash',
    cashEvidence: 'Aucun paiement attribué prouvé.', dedicatedPath: '/pilotage-arbitragepro',
  },
  {
    slug: 'propecto', name: 'Propecto', url: 'https://www.propecto.eu',
    github: 'julien2364/annuaire', vercelProjectId: 'prj_iTUKEu3BUVEGJpxm9nS0Km7vjIUs',
    state: 'Production publique', commercialGate: 'Offre publique → checkout → paiement',
    cashEvidence: 'Aucun encaissement attribué prouvé dans ce cockpit.',
  },
  {
    slug: 'cvdesignpro', name: 'CVDesignPro', url: 'https://www.cvdesignpro.com/fr',
    github: 'julien2364/cvdesignpro', vercelProjectId: 'prj_sbz1BpKKEmUMe1qLASFYIFahRxKA',
    state: 'Production publique', commercialGate: 'Démarrage → checkout → abonnement',
    cashEvidence: 'Le cockpit dédié lit les métriques internes ; cash attribué non exposé ici.',
  },
  {
    slug: 'ecole-connect', name: 'École Connect', url: 'https://ecole-connect-pied.vercel.app',
    github: 'julien2364/ecole-connect', vercelProjectId: 'prj_6t8rABLHNlvQb0sUMb0gT55P50E7',
    state: 'Production publique, non monétisée', commercialGate: 'Offre payante et checkout absents',
    cashEvidence: '0 € attendu tant que la monétisation n’est pas définie.',
  },
  {
    slug: 'courshub', name: 'CoursHub', url: 'https://coursehub-dusky-seven.vercel.app',
    github: 'julien2364/Coursehub', vercelProjectId: null,
    state: 'Production publique, non monétisée', commercialGate: 'Offre payante et checkout absents',
    cashEvidence: '0 € attendu tant que la monétisation n’est pas définie.',
  },
  {
    slug: 'quizplay', name: 'QuizPlay', url: 'https://quizplay-production.up.railway.app/',
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
    return { ok: response.ok, status: response.status, finalUrl: response.url, latencyMs, checkedAt: new Date().toISOString() };
  } catch (error) {
    return { ok: false, status: null, error: error.message || String(error), checkedAt: new Date().toISOString() };
  }
}

async function readSitemap(project) {
  const sitemapUrl = Object.prototype.hasOwnProperty.call(project, 'sitemapUrl') ? project.sitemapUrl : `${project.url.replace(/\/$/, '')}/sitemap.xml`;
  if (!sitemapUrl) return { configured: false, reason: 'Aucun sitemap public applicable.' };
  try {
    const { response, latencyMs } = await fetchWithTimeout(sitemapUrl, { method: 'GET' });
    const text = await response.text();
    const locCount = (text.match(/<loc(?:\s[^>]*)?>/gi) || []).length;
    const lastmods = [...text.matchAll(/<lastmod(?:\s[^>]*)?>([^<]+)<\/lastmod>/gi)].map((match) => match[1]).sort();
    return { configured: true, ok: response.ok, status: response.status, url: response.url, entries: locCount, latestLastmod: lastmods.at(-1) || null, latencyMs, checkedAt: new Date().toISOString() };
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
      etsy: { state: 'manual_snapshot', note: 'Etsy bloque la lecture publique automatisée et aucune clé API/OAuth Etsy n’est configurée.' },
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
