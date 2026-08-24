// Client minimal pour l'API REST de Make (make.com) — ajouté le 24/08/2026 à la demande de Julien :
// "Moteur Make / Je veux voir ça" (montré via une capture de la liste des scénarios Make). Avant cette
// version, le dashboard affichait un instantané écrit à la main le 24/08 — remplacé ici par un vrai
// appel direct à l'API Make à chaque chargement de l'onglet.
//
// Configuration attendue en variables d'environnement Vercel (jamais en dur ici) :
//   MAKE_API_TOKEN  (Make → icône profil → API → Add token ; portée minimale : scenarios:read, folders:read)
//   MAKE_ZONE       (optionnel, défaut eu2.make.com — vérifié le 24/08/2026 via organizations_list : la
//                    zone de l'organisation "My Organization" de Julien est eu2.make.com)
//   MAKE_TEAM_ID    (optionnel, défaut 111657 — id de l'équipe "My Team" de Julien, vérifié le 24/08/2026 ;
//                    à changer seulement si une autre équipe Make est utilisée un jour)
//
// Si MAKE_API_TOKEN n'est pas configuré, isMakeConfigured() renvoie false et l'appelant garde son
// instantané statique de repli — aucune erreur ne remonte à l'utilisateur.

const MAKE_ZONE = process.env.MAKE_ZONE || 'eu2.make.com';
const MAKE_TEAM_ID = process.env.MAKE_TEAM_ID || '111657';
const FETCH_TIMEOUT_MS = 8000;

function isMakeConfigured() {
  return Boolean(process.env.MAKE_API_TOKEN);
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

async function makeGet(path) {
  const res = await fetchWithTimeout(`https://${MAKE_ZONE}/api/v2${path}`, {
    headers: { Authorization: `Token ${process.env.MAKE_API_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Appel Make ${path} échoué (HTTP ${res.status}) ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function makePost(path) {
  const res = await fetchWithTimeout(`https://${MAKE_ZONE}/api/v2${path}`, {
    method: 'POST',
    headers: { Authorization: `Token ${process.env.MAKE_API_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // Make renvoie une erreur explicite si le scénario est déjà dans l'état demandé — pas un vrai échec.
    if (/already running|not running/i.test(body)) return { alreadyInThatState: true };
    throw new Error(`Appel Make ${path} échoué (HTTP ${res.status}) ${body.slice(0, 200)}`);
  }
  return res.json().catch(() => ({}));
}

// Active/désactive un scénario Make — ajouté le 24/08/2026 à la demande de Julien : "Make possible
// d'activer les flux depuis notre interface ?". Utilisé par le bouton on/off dans l'onglet
// Réseaux — Pilotage, à côté du même statut visible dans Make lui-même.
async function setScenarioActive(scenarioId, active) {
  return makePost(`/scenarios/${scenarioId}/${active ? 'start' : 'stop'}`);
}

// Icônes courtes par app Make utilisée — juste pour l'affichage, pas exhaustif (repli sur le nom brut
// du package si non listé ici).
const APP_LABELS = {
  'google-sheets': 'Sheets', 'google-drive': 'Drive', 'google-email': 'Gmail',
  'facebook-pages': 'Facebook', linkedin: 'LinkedIn', 'instagram-business': 'Instagram',
  youtube: 'YouTube', http: 'HTTP', json: 'JSON', builtin: 'Builtin', util: 'Util',
  datastore: 'Data Store', gateway: 'Webhook', 'openai-gpt-3': 'OpenAI',
};

async function getMakeSnapshot() {
  if (!isMakeConfigured()) return { configured: false };
  try {
    const [scenariosRes, foldersRes] = await Promise.all([
      makeGet(`/scenarios?teamId=${MAKE_TEAM_ID}`),
      makeGet(`/folders?teamId=${MAKE_TEAM_ID}`),
    ]);
    const scenarios = (scenariosRes.scenarios || scenariosRes || []).map((s) => ({
      id: s.id,
      nom: s.name,
      actif: Boolean(s.isActive),
      invalide: Boolean(s.isinvalid),
      dossier: s.folderPath || null,
      planification: s.scheduling ? s.scheduling.type : null,
      derniereMaj: s.lastEdit,
      prochaineExecution: s.nextExec || null,
      executions: s.executions || 0,
      operations: s.operations || 0,
      transferOctets: s.transfer || 0,
      erreurs: s.errors || 0,
      apps: Array.from(new Set((s.usedPackages || []).map((p) => APP_LABELS[p] || p))),
    }));
    const folders = (foldersRes.folders || foldersRes || []).map((f) => ({ id: f.id, nom: f.name, total: f.scenariosTotal }));
    return {
      configured: true,
      capturedAt: new Date().toISOString(),
      total: scenarios.length,
      actifs: scenarios.filter((s) => s.actif).length,
      enErreur: scenarios.filter((s) => s.erreurs > 0).length,
      dossiers: folders,
      scenarios,
    };
  } catch (err) {
    return { configured: true, error: err.message || String(err) };
  }
}

module.exports = { isMakeConfigured, getMakeSnapshot, setScenarioActive, MAKE_ZONE, MAKE_TEAM_ID };
