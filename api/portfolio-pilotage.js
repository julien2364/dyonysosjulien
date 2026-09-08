const { requireSession } = require('./_lib/session');
const { getPortfolioPilotage } = require('./_lib/portfolio-pilotage');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    return res.status(200).json(await getPortfolioPilotage());
  } catch (error) {
    return res.status(500).json({ error: 'Pilotage portefeuille indisponible.', detail: error.message || String(error) });
  }
};
