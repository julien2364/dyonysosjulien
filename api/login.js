const crypto = require('crypto');
const json = (res, code, body) => res.status(code).json(body);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const sign = value => crypto.createHmac('sha256', process.env.PRIVATE_SESSION_SECRET || '').update(value).digest('hex');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Méthode non autorisée.' });
  const { email = '', password = '' } = req.body || {};
  const expectedEmail = process.env.PRIVATE_EMAIL || '';
  const expectedHash = process.env.PRIVATE_PASSWORD_HASH || '';
  const salt = process.env.PRIVATE_PASSWORD_SALT || '';
  const validEmail = email.trim().toLowerCase() === expectedEmail.trim().toLowerCase();
  const suppliedHash = hash(`${salt}:${password}`);
  const validHash = expectedHash.length === suppliedHash.length && crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(suppliedHash));
  if (!validEmail || !validHash || !process.env.PRIVATE_SESSION_SECRET) return json(res, 401, { error: 'Identifiant ou mot de passe incorrect.' });
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const value = `${expires}.${sign(String(expires))}`;
  res.setHeader('Set-Cookie', `dyonysos_admin=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
  return json(res, 200, { ok: true });
};
