const fs = require('fs');
const path = require('path');
const { validSession } = require('./_lib/session');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Méthode non autorisée.');
  if (!validSession(req)) {
    res.setHeader('Cache-Control', 'private, no-store');
    return res.redirect(302, '/espace-prive?next=/pilotage-portefeuille');
  }
  const page = fs.readFileSync(path.join(process.cwd(), 'api', '_templates', 'pilotage-portefeuille.html'), 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).send(page);
};
