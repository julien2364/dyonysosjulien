const { requireSession } = require('./_lib/session');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const token = process.env.CVDP_PILOTAGE_TOKEN || '';
  if (!token) return res.status(503).json({ error: 'Liaison CVDesignPro non configurée.' });
  try {
    const response = await fetch('https://www.cvdesignpro.com/api/internal/pilotage', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(9000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({ error: 'CVDesignPro ne répond pas au pilotage.', upstreamStatus: response.status });
    }
    return res.status(200).json(payload);
  } catch (_) {
    return res.status(502).json({ error: 'Pilotage CVDesignPro momentanément indisponible.' });
  }
};
