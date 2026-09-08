const DEFAULT_BASE_URL = 'https://automation.dyonysos.fr';
const TIMEOUT_MS = 7000;

function baseUrl() {
  return String(process.env.AUTOMATION_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

function authConfigured() {
  return Boolean(process.env.ACTIVEPIECES_API_KEY || process.env.AUTOMATION_API_KEY);
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const json = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, json };
  } finally {
    clearTimeout(timer);
  }
}

async function checkWebService(name, url, expectedRedirect) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { redirect: 'manual', signal: controller.signal });
    const location = response.headers.get('location') || '';
    return {
      name,
      url,
      reachable: response.status >= 200 && response.status < 400,
      status: response.status,
      expectedEntryPoint: expectedRedirect,
      entryPointObserved: location || url,
    };
  } catch (error) {
    return { name, url, reachable: false, status: null, error: error?.name === 'AbortError' ? 'délai dépassé' : String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

async function getAutomationStatus() {
  const checkedAt = new Date().toISOString();
  const url = baseUrl();
  try {
    const [health, odooRaw, postizRaw] = await Promise.all([
      fetchJson(`${url}/api/v1/health`),
      checkWebService('Odoo — Email Marketing', process.env.ODOO_VPS_URL || 'https://odoo.dyonysos.fr', '/odoo'),
      checkWebService('Postiz — réseaux sociaux', process.env.POSTIZ_URL || 'https://social.dyonysos.fr', '/auth'),
    ]);
    const odoo = {
      ...odooRaw,
      operational: false,
      verification: 'Interface Email Marketing contrôlée le 08/09/2026 : 117 mailings visibles ; les lignes échantillonnées sont en brouillon. Aucun envoi de test n’a été déclenché.',
    };
    const postiz = {
      ...postizRaw,
      operational: false,
      verification: 'Interface /launches contrôlée le 08/09/2026 : page chargée mais écran vide/noir. Bascule interdite tant que l’affichage et un test de publication complet ne réussissent pas.',
    };
    const healthy = health.ok && String(health.json?.status || '').toLowerCase() === 'healthy';
    return {
      provider: 'Activepieces',
      url,
      reachable: health.ok,
      healthy,
      healthStatus: health.json?.status || `HTTP ${health.status}`,
      authConfigured: authConfigured(),
      flowsVisible: false,
      services: [odoo, postiz],
      recentRunCheck: {
        verifiedAt: checkedAt,
        result: 'succès observés',
        examples: [
          '[Deals Social] 05 — Ingestion RSS + génération des posts',
          'Le Fil — Vidéos YouTube (RSS → Odoo)',
          'Le Fil Indépendant — Veille presse (RSS → Odoo)',
        ],
        note: 'Contrôle visuel du journal Activepieces le 08/09/2026. Ces succès prouvent que le moteur exécute des flux, pas que tous les parcours marketing sont prêts à être basculés.',
      },
      checkedAt,
      note: authConfigured()
        ? 'Le moteur répond. La clé serveur est présente ; l’inventaire détaillé des flux reste volontairement désactivé tant que le périmètre de lecture de l’API n’est pas validé.'
        : 'Le moteur VPS répond en direct. Aucun accès API authentifié n’est configuré dans ce site : l’état de santé est réel, mais les flux et leurs exécutions ne sont pas encore lisibles ici.',
    };
  } catch (error) {
    return {
      provider: 'Activepieces',
      url,
      reachable: false,
      healthy: false,
      healthStatus: error?.name === 'AbortError' ? 'délai dépassé' : String(error?.message || error),
      authConfigured: authConfigured(),
      flowsVisible: false,
      services: [],
      checkedAt,
      note: 'Le contrôle de santé du moteur VPS a échoué. Cette erreur n’implique pas que les automatisations sont arrêtées ; leur état détaillé nécessite un accès API authentifié.',
    };
  }
}

module.exports = { getAutomationStatus, authConfigured, baseUrl, checkWebService };
