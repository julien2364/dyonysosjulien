const { requireSession } = require('./_lib/session');
const { getArbitragePilotage } = require('./_lib/arbitrage-pilotage');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;

  res.setHeader('Cache-Control', 'private, no-store');
  try {
    return res.status(200).json(await getArbitragePilotage());
  } catch (error) {
    return res.status(503).json({
      error: 'Le cockpit ArbitragePro+ ne peut pas être actualisé pour le moment.',
      detail: error && error.message ? error.message : String(error),
    });
  }
};
