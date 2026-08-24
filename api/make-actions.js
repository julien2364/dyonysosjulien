// Actions de pilotage sur le moteur Make depuis le dashboard — ajouté le 24/08/2026 à la demande de
// Julien : "Make possible d'activer les flux depuis notre interface ?". Pour l'instant une seule
// action : activer/désactiver un scénario (même effet que le bouton on/off dans Make lui-même).
const { requireSession } = require('./_lib/session');
const { isMakeConfigured, setScenarioActive } = require('./_lib/make-client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  if (!isMakeConfigured()) {
    return res.status(400).json({ error: 'Make non configuré (MAKE_API_TOKEN manquant côté Vercel).' });
  }

  const { action, scenarioId } = req.body || {};
  if (!scenarioId) return res.status(400).json({ error: 'scenarioId requis.' });

  try {
    if (action === 'activate') {
      await setScenarioActive(Number(scenarioId), true);
      return res.status(200).json({ ok: true, scenarioId, actif: true });
    }
    if (action === 'deactivate') {
      await setScenarioActive(Number(scenarioId), false);
      return res.status(200).json({ ok: true, scenarioId, actif: false });
    }
    return res.status(400).json({ error: `action inconnue : ${action}` });
  } catch (err) {
    return res.status(502).json({ error: err.message || String(err) });
  }
};
