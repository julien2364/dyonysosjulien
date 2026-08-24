// Client pour le nouvel Odoo auto-hébergé sur le VPS OVH (odoo.dyonysos.fr), distinct de l'Odoo
// de pet-stone.shop utilisé ailleurs dans le dashboard.
//
// Mis à jour le 24/08/2026 : identifiants confirmés par Julien ("Odoo identifiants c'est ok") —
// authentification JSON-RPC réelle ajoutée (common.authenticate + object.execute_kw), plus le
// simple ping /web/webclient/version_info conservé comme repli si l'auth échoue.
//
// Variables d'environnement Vercel :
//   ODOO_INTERNE_URL      (optionnel, défaut https://odoo.dyonysos.fr)
//   ODOO_INTERNE_DB       (nom de la base créée sur ce serveur)
//   ODOO_INTERNE_LOGIN    (email admin)
//   ODOO_INTERNE_PASSWORD (mot de passe ou clé API admin)

const ODOO_INTERNE_URL = process.env.ODOO_INTERNE_URL || 'https://odoo.dyonysos.fr';
const FETCH_TIMEOUT_MS = 8000;

function isOdooInterneConfigured() {
  return Boolean(process.env.ODOO_INTERNE_DB && process.env.ODOO_INTERNE_LOGIN && process.env.ODOO_INTERNE_PASSWORD);
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function jsonRpc(service, method, args) {
  const res = await fetchWithTimeout(`${ODOO_INTERNE_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service, method, args } }),
  });
  if (!res.ok) {
    throw new Error(`Odoo interne — HTTP ${res.status} sur ${service}.${method}`);
  }
  const data = await res.json();
  if (data.error) {
    const msg = data.error.data?.message || data.error.message || JSON.stringify(data.error).slice(0, 300);
    throw new Error(`Odoo interne — ${msg}`);
  }
  return data.result;
}

// Authentifie et renvoie l'uid Odoo (entier) du compte configuré.
async function odooAuthenticate() {
  const db = process.env.ODOO_INTERNE_DB;
  const login = process.env.ODOO_INTERNE_LOGIN;
  const password = process.env.ODOO_INTERNE_PASSWORD;
  const uid = await jsonRpc('common', 'authenticate', [db, login, password, {}]);
  if (!uid) {
    throw new Error('Authentification refusée — vérifie ODOO_INTERNE_DB/LOGIN/PASSWORD.');
  }
  return uid;
}

// Appel générique object.execute_kw — utilisable pour tout modèle/méthode Odoo standard
// (search_read, create, write...). À réserver aux lectures pour l'instant côté dashboard ;
// les écritures passent par des fonctions dédiées explicites, pas par un appel générique exposé.
async function odooExecuteKw(model, method, args = [], kwargs = {}) {
  const db = process.env.ODOO_INTERNE_DB;
  const password = process.env.ODOO_INTERNE_PASSWORD;
  const uid = await odooAuthenticate();
  return jsonRpc('object', 'execute_kw', [db, uid, password, model, method, args, kwargs]);
}

// Ping simple, sans authentification — sert de repli si les identifiants ne sont pas (encore)
// configurés ou si l'auth échoue.
async function pingVersion() {
  const res = await fetchWithTimeout(`${ODOO_INTERNE_URL}/web/webclient/version_info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.result || {}).server_version || null;
}

async function getOdooInterneStatus() {
  if (!isOdooInterneConfigured()) {
    try {
      const serverVersion = await pingVersion();
      return {
        reachable: true,
        configured: false,
        url: ODOO_INTERNE_URL,
        serverVersion,
        checkedAt: new Date().toISOString(),
        pourAllerPlusLoin: 'Ping seul — ODOO_INTERNE_DB/LOGIN/PASSWORD pas encore configurés côté Vercel pour aller plus loin (sociétés, données réelles).',
      };
    } catch (err) {
      return { reachable: false, configured: false, url: ODOO_INTERNE_URL, error: err.message || String(err) };
    }
  }
  try {
    const companies = await odooExecuteKw('res.company', 'search_read', [[]], { fields: ['id', 'name', 'currency_id', 'country_id'] });
    return {
      reachable: true,
      configured: true,
      url: ODOO_INTERNE_URL,
      db: process.env.ODOO_INTERNE_DB,
      checkedAt: new Date().toISOString(),
      companies: companies.map((c) => ({ id: c.id, nom: c.name, devise: c.currency_id ? c.currency_id[1] : null, pays: c.country_id ? c.country_id[1] : null })),
    };
  } catch (err) {
    return { reachable: false, configured: true, url: ODOO_INTERNE_URL, error: err.message || String(err) };
  }
}

module.exports = { getOdooInterneStatus, isOdooInterneConfigured, odooExecuteKw, odooAuthenticate, ODOO_INTERNE_URL };
