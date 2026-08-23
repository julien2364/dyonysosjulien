const crypto = require('crypto');
const { put } = require('@vercel/blob');

const decodeGeo = value => {
  try { return decodeURIComponent(String(value || '')).trim(); }
  catch { return String(value || '').trim(); }
};

const allowedOrigin = value => {
  if (!value) return true;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === 'dyonysos.fr' || hostname === 'www.dyonysos.fr' || hostname.endsWith('-dyonysos.vercel.app');
  } catch { return false; }
};

module.exports = async function handler(req, res) {
  const startedAt = Date.now();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!allowedOrigin(req.headers.origin)) return res.status(403).json({ error: 'Origine non autorisée.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(204).end();

  const userAgent = String(req.headers['user-agent'] || '');
  if (/bot|crawler|spider|slurp|headless|lighthouse|preview/i.test(userAgent)) return res.status(204).end();

  const city = decodeGeo(req.headers['x-vercel-ip-city']).slice(0, 120);
  const region = decodeGeo(req.headers['x-vercel-ip-country-region']).slice(0, 80);
  const country = decodeGeo(req.headers['x-vercel-ip-country']).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  if (!city || !country) return res.status(204).end();

  const date = new Date().toISOString().slice(0, 10);
  const citySegment = encodeURIComponent(city);
  const pathname = `analytics/cities/${date}/${country}/${citySegment}/${crypto.randomUUID()}.json`;

  try {
    await put(pathname, JSON.stringify({ city, region, country, date }), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log(JSON.stringify({ level: 'info', msg: 'done', route: '/api/city-visit', ms: Date.now() - startedAt }));
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(204).end();
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', msg: 'failed', route: '/api/city-visit', error: error.message, ms: Date.now() - startedAt }));
    return res.status(204).end();
  }
};
