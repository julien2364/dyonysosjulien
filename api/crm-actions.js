const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');
const { STAGES, ensurePipeline, upsertOpportunity } = require('./_lib/crm-pipeline-store');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');
  const { action } = req.body || {};
  try {
    if (action === 'bootstrap') {
      const pipeline = await ensurePipeline();
      return res.status(200).json({ ok: true, ...pipeline });
    }
    if (action === 'upsert') {
      const item = req.body?.opportunity || {};
      if (!item.company || !String(item.company).trim()) return res.status(400).json({ error: 'Société requise.' });
      if (item.projectId && !PROJECTS.some((p) => p.name === item.projectId)) return res.status(400).json({ error: 'Projet inconnu.' });
      if (item.stage && !STAGES.includes(item.stage)) return res.status(400).json({ error: 'Étape commerciale invalide.' });
      const opportunity = await upsertOpportunity(item);
      return res.status(200).json({ ok: true, opportunity });
    }
    return res.status(400).json({ error: 'Action inconnue.' });
  } catch (error) {
    if (error.code === 'NOT_CONFIGURED') return res.status(501).json({ error: 'Google Sheets non configuré.' });
    return res.status(502).json({ error: error.message || String(error) });
  }
};
