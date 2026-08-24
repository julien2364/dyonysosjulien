// Actions Taiga déclenchées depuis le dashboard /espace-prive — "piloter" Taiga (créer une user
// story, une tâche, changer un statut) sans que Claude détienne d'identifiants Taiga en direct :
// ce endpoint, protégé par la même session privée que le reste du dashboard, agit avec le compte
// configuré en TAIGA_USERNAME/TAIGA_PASSWORD (variables Vercel). Ajouté le 24/08/2026.
const { requireSession } = require('./_lib/session');
const { createUserStory, createTask, updateUserStoryStatus, isTaigaConfigured } = require('./_lib/taiga-client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  if (!isTaigaConfigured()) {
    return res.status(400).json({ error: 'Taiga non configuré (TAIGA_USERNAME/TAIGA_PASSWORD manquants côté Vercel).' });
  }

  const { action, projectId, subject, description, userStoryId, statusId, version } = req.body || {};

  try {
    let result;
    switch (action) {
      case 'create_story':
        if (!projectId || !subject) return res.status(400).json({ error: 'projectId et subject requis.' });
        result = await createUserStory(projectId, subject, description);
        break;
      case 'create_task':
        if (!projectId || !userStoryId || !subject) {
          return res.status(400).json({ error: 'projectId, userStoryId et subject requis.' });
        }
        result = await createTask(projectId, userStoryId, subject);
        break;
      case 'update_status':
        if (!userStoryId || !statusId || version === undefined) {
          return res.status(400).json({ error: 'userStoryId, statusId et version requis.' });
        }
        result = await updateUserStoryStatus(userStoryId, statusId, version);
        break;
      default:
        return res.status(400).json({ error: `action inconnue : ${action}` });
    }
    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(502).json({ error: err.message || String(err) });
  }
};
