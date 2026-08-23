// Session partagée avec le reste de l'espace privé (même cookie, même secret).
// Aucune authentification séparée : Pilotage Social utilise exactement le login
// existant de /espace-prive (PRIVATE_EMAIL / PRIVATE_PASSWORD_HASH / PRIVATE_SESSION_SECRET).
const crypto = require('crypto');

const sign = value => crypto.createHmac('sha256', process.env.PRIVATE_SESSION_SECRET || '').update(value).digest('hex');

function validSession(req) {
  const cookie = String(req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith('dyonysos_admin='));
  if (!cookie || !process.env.PRIVATE_SESSION_SECRET) return false;
  const [expires, signature] = decodeURIComponent(cookie.slice('dyonysos_admin='.length)).split('.');
  const expected = sign(expires || '');
  if (!signature || signature.length !== expected.length) return false;
  return Number(expires) > Date.now() && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function requireSession(req, res) {
  if (!validSession(req)) {
    res.status(401).json({ error: 'Session privée requise.' });
    return false;
  }
  return true;
}

module.exports = { validSession, requireSession };
