const WORKER_URL = 'https://dyonysos-i18n-translator.dyonysos.workers.dev';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const cronSecret = process.env.CRON_SECRET;
  const translatorSecret = process.env.I18N_TRANSLATOR_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  if (!translatorSecret) return res.status(503).json({ ok: false, error: 'translator_not_configured' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(`${WORKER_URL}/health-checks/run`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${translatorSecret}` },
      signal: controller.signal,
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(response.status).send(await response.text());
  } catch {
    return res.status(502).json({ ok: false, error: 'health_check_unavailable' });
  } finally {
    clearTimeout(timeout);
  }
};
