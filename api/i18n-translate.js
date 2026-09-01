const WORKER_URL = 'https://dyonysos-i18n-translator.dyonysos.workers.dev';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return res.status(403).json({ ok: false, error: 'forbidden_origin' });
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid_origin' });
    }
  }
  const secret = process.env.I18N_TRANSLATOR_SECRET;
  if (!secret) return res.status(503).json({ ok: false, error: 'translator_not_configured' });
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const encoded = JSON.stringify({ ...body, site_id: 'dyonysos' });
  if (Buffer.byteLength(encoded, 'utf8') > 96 * 1024) return res.status(413).json({ ok: false, error: 'payload_too_large' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(WORKER_URL + '/translate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: encoded,
      signal: controller.signal,
    });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(response.status).send(await response.text());
  } catch {
    return res.status(502).json({ ok: false, error: 'translator_unavailable' });
  } finally {
    clearTimeout(timeout);
  }
};

