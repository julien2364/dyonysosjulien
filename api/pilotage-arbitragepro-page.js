const fs = require('fs');
const path = require('path');
const { validSession } = require('./_lib/session');

module.exports = function handler(req, res) {
  if (!validSession(req)) {
    res.setHeader('Cache-Control', 'private, no-store');
    return res.redirect(302, '/espace-prive?next=/pilotage-arbitragepro');
  }

  const page = fs.readFileSync(
    path.join(process.cwd(), 'api', '_templates', 'pilotage-arbitragepro.html'),
    'utf8',
  );
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  return res.status(200).send(page);
};
