// Client minimal pour l'API REST de Taiga (instance self-hostée sur le VPS OVH, taiga.dyonysos.fr).
// Taiga n'a pas de "clé API" en libre-service (vérifié le 24/08/2026 dans sa doc officielle) : l'auth
// se fait par login (username + password) qui renvoie un token JWT à durée limitée. On relogue donc
// à chaque appel (usage interne/faible fréquence — pas besoin de cache de token pour l'instant).
//
// Configuration attendue en variables d'environnement Vercel (jamais en dur ici) :
//   TAIGA_BASE_URL  (optionnel, défaut https://taiga.dyonysos.fr)
//   TAIGA_USERNAME
//   TAIGA_PASSWORD
//
// Si TAIGA_USERNAME/TAIGA_PASSWORD ne sont pas configurées, isTaigaConfigured() renvoie false et
// l'appelant (api/crm.js) garde son message statique actuel — aucune erreur ne remonte à l'utilisateur.

const TAIGA_BASE_URL = process.env.TAIGA_BASE_URL || 'https://taiga.dyonysos.fr';
const FETCH_TIMEOUT_MS = 8000;

function isTaigaConfigured() {
  return Boolean(process.env.TAIGA_USERNAME && process.env.TAIGA_PASSWORD);
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

async function taigaLogin() {
  const res = await fetchWithTimeout(`${TAIGA_BASE_URL}/api/v1/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'normal',
      username: process.env.TAIGA_USERNAME,
      password: process.env.TAIGA_PASSWORD,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Login Taiga échoué (HTTP ${res.status}) ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.auth_token;
}

async function taigaGet(path, token) {
  const res = await fetchWithTimeout(`${TAIGA_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Appel Taiga ${path} échoué (HTTP ${res.status}) ${body.slice(0, 200)}`);
  }
  return res.json();
}

// Snapshot léger : liste des projets visibles par le compte configuré, avec quelques compteurs.
// Volontairement peu profond (pas de détail tâche par tâche) pour rester rapide dans une fonction
// serverless — le dashboard peut être approfondi projet par projet plus tard si besoin.
async function getTaigaSnapshot() {
  if (!isTaigaConfigured()) {
    return { configured: false };
  }
  try {
    const token = await taigaLogin();
    // Corrigé le 24/08/2026 : /api/v1/projects?member=me renvoie une erreur 400 côté Taiga
    // ("Error in filter params types") — le filtre `member` attend un id numérique, pas le mot
    // "me". On récupère donc d'abord l'id réel de l'utilisateur connecté via /api/v1/users/me
    // (confirmé dans la doc officielle Taiga), puis on filtre avec ce numéro.
    const me = await taigaGet('/api/v1/users/me', token);
    const projects = await taigaGet(`/api/v1/projects?member=${me.id}`, token);
    const resume = projects.map((p) => ({
      id: p.id,
      nom: p.name,
      slug: p.slug,
      url: `${TAIGA_BASE_URL}/project/${p.slug}/`,
      totalHistorias: p.total_story_points ?? null,
      isBacklogActivated: p.is_backlog_activated,
      isKanbanActivated: p.is_kanban_activated,
      isIssuesActivated: p.is_issues_activated,
    }));
    return {
      configured: true,
      capturedAt: new Date().toISOString(),
      baseUrl: TAIGA_BASE_URL,
      totalProjets: resume.length,
      projets: resume,
    };
  } catch (err) {
    return { configured: true, error: err.message || String(err) };
  }
}

// --- Écriture (ajouté le 24/08/2026, à la demande de Julien : "tu peux piloter Taiga ?") ---
// Ces fonctions permettent de créer/mettre à jour des éléments Taiga (user stories, tasks,
// changement de statut). Elles réutilisent le même compte configuré en TAIGA_USERNAME/PASSWORD
// pour l'instant — recommandé : passer sur un compte bot dédié (pas le compte personnel de Julien)
// avant un usage régulier en écriture, pour limiter la portée d'un jeton si jamais il fuite.
// Volontairement pas appelées automatiquement nulle part : à brancher sur une route protégée
// (ex. api/taiga-write.js) le jour où Julien confirme comment il veut que ces actions soient
// déclenchées (depuis le dashboard, ou directement par moi en session — cf. discussion sécurité).

async function taigaPost(path, token, body) {
  const res = await fetchWithTimeout(`${TAIGA_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Écriture Taiga ${path} échouée (HTTP ${res.status}) ${errBody.slice(0, 200)}`);
  }
  return res.json();
}

async function taigaPatch(path, token, body) {
  const res = await fetchWithTimeout(`${TAIGA_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Mise à jour Taiga ${path} échouée (HTTP ${res.status}) ${errBody.slice(0, 200)}`);
  }
  return res.json();
}

// Liste brute des projets Taiga du compte configuré (id/name/slug) — sert à vérifier avant
// création si un projet du même nom existe déjà (évite les doublons lors d'un seed en masse).
async function listMyProjectsRaw() {
  const token = await taigaLogin();
  const me = await taigaGet('/api/v1/users/me', token);
  return taigaGet(`/api/v1/projects?member=${me.id}`, token);
}

// Crée un projet Taiga (ajouté le 24/08/2026 pour le seed en masse des projets du portefeuille).
async function createProject(name, description) {
  const token = await taigaLogin();
  return taigaPost('/api/v1/projects', token, {
    name,
    description: description || '',
    is_backlog_activated: true,
    is_kanban_activated: true,
    is_issues_activated: false,
  });
}

// Crée une user story dans un projet donné.
async function createUserStory(projectId, subject, description) {
  const token = await taigaLogin();
  return taigaPost('/api/v1/userstories', token, {
    project: projectId,
    subject,
    description: description || '',
  });
}

// Crée une tâche rattachée à une user story existante.
async function createTask(projectId, userStoryId, subject) {
  const token = await taigaLogin();
  return taigaPost('/api/v1/tasks', token, {
    project: projectId,
    user_story: userStoryId,
    subject,
  });
}

// Change le statut d'une user story (statusId = id du statut cible dans le projet, à récupérer
// via GET /api/v1/userstory-statuses?project=<projectId>).
async function updateUserStoryStatus(userStoryId, statusId, version) {
  const token = await taigaLogin();
  return taigaPatch(`/api/v1/userstories/${userStoryId}`, token, {
    status: statusId,
    version, // Taiga exige le numéro de version courant de l'objet pour éviter les écrasements concurrents
  });
}

module.exports = {
  isTaigaConfigured,
  getTaigaSnapshot,
  TAIGA_BASE_URL,
  createUserStory,
  createTask,
  updateUserStoryStatus,
  createProject,
  listMyProjectsRaw,
};
