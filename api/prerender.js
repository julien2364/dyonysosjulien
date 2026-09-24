// Pages traduites dans le navigateur, servies pré-rendues : voir api/_lib/prerender.js.
const { prerender } = require('./_lib/prerender');

module.exports = (req, res) => {
  const p = String(req.query.p || '');
  const out = /^\/[a-z0-9/-]*$/.test(p) ? prerender(p) : null;
  if (!out) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(404).send('Not found');
  }
  if (out.errors.length) console.error('prerender', p, out.errors);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', out.errors.length ? 'public, s-maxage=60' : 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(out.status).send(out.html);
};
