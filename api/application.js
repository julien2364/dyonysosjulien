const crypto = require('crypto');

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const allowedTypes = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};
const MAX_FILE_SIZE = 2621440;

const validSignature = (buffer, extension) => {
  const start = buffer.subarray(0, 8).toString('hex');
  if (extension === 'pdf') return buffer.subarray(0, 5).toString() === '%PDF-';
  if (extension === 'doc') return start === 'd0cf11e0a1b11ae1';
  if (extension === 'docx') return start.startsWith('504b0304') || start.startsWith('504b0506');
  return false;
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  try {
    const { nom = '', prenom = '', email = '', telephone = '', linkedin = '', message = '', website = '', consent = false, cv } = req.body || {};
    if (website) return res.status(200).json({ ok: true });
    if (!nom.trim() || !prenom.trim() || !email.trim() || !cv?.content || consent !== true) return res.status(400).json({ error: 'Nom, prénom, email, CV et consentement sont obligatoires.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) return res.status(400).json({ error: 'Adresse email invalide.' });
    if (nom.length > 100 || prenom.length > 100 || telephone.length > 40 || linkedin.length > 300 || message.length > 4000 || String(cv.name || '').length > 160) return res.status(400).json({ error: 'Un champ dépasse la longueur autorisée.' });
    if (linkedin && !/^https?:\/\//i.test(linkedin)) return res.status(400).json({ error: 'Le lien LinkedIn ou portfolio est invalide.' });
    const rawName = String(cv.name || '').normalize('NFKC');
    const extension = rawName.split('.').pop().toLowerCase();
    if (!allowedTypes[extension]) return res.status(400).json({ error: 'Le CV doit être au format PDF, DOC ou DOCX.' });
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(String(cv.content)) || String(cv.content).length > 3600000) return res.status(400).json({ error: 'Le contenu du CV est invalide.' });
    const file = Buffer.from(cv.content, 'base64');
    if (!file.length || file.length > MAX_FILE_SIZE || Number(cv.size) !== file.length) return res.status(400).json({ error: 'Le CV ne doit pas dépasser 2,5 Mo.' });
    if (!validSignature(file, extension)) return res.status(400).json({ error: 'Le fichier joint ne correspond pas au format annoncé.' });
    if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Service d’envoi temporairement indisponible.' });

    const safeFilename = rawName.replace(/[\\/\u0000-\u001f\u007f]/g, '-').replace(/[^\p{L}\p{N}._ -]/gu, '_');
    const fullName = `${prenom.trim()} ${nom.trim()}`;
    const html = `<h2>Candidature spontanée depuis dyonysos.fr</h2><p><strong>Candidat :</strong> ${escapeHtml(fullName)}</p><p><strong>Email :</strong> ${escapeHtml(email)}</p><p><strong>Téléphone :</strong> ${escapeHtml(telephone || 'Non précisé')}</p><p><strong>LinkedIn / portfolio :</strong> ${linkedin ? `<a href="${escapeHtml(linkedin)}">${escapeHtml(linkedin)}</a>` : 'Non précisé'}</p><hr><p style="white-space:pre-wrap">${escapeHtml(message || 'Aucun message')}</p><p><em>Le CV est joint à cet email.</em></p>`;
    const domain = String(process.env.RESEND_EMAIL_DOMAIN || 'dyonysos.fr').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const payload = {
      from: `Dyonysos <contact@${domain}>`,
      to: [process.env.CONTACT_TO || 'julien.daures@gmail.com'],
      reply_to: email,
      subject: `Candidature spontanée depuis dyonysos.fr — ${fullName}`,
      html,
      attachments: [{ filename: safeFilename, content: cv.content, content_type: allowedTypes[extension] }]
    };
    const hash = crypto.createHash('sha256').update(`${email}\n${safeFilename}\n${cv.content}`).digest('hex').slice(0, 40);
    const request = async (fallback = false) => fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `application/${fallback ? 'fallback-' : ''}${hash}` },
      body: JSON.stringify(payload)
    });
    let response = await request(false);
    let resendError = response.ok ? '' : await response.text();
    if (!response.ok) {
      payload.from = 'Dyonysos <onboarding@resend.dev>';
      response = await request(true);
    }
    if (!response.ok) {
      resendError += ` | fallback: ${await response.text()}`;
      console.error('Resend application error:', resendError);
      return res.status(502).json({ error: 'La candidature n’a pas pu être envoyée. Merci de réessayer ultérieurement.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Application handler error:', error?.message || error);
    return res.status(500).json({ error: 'Une erreur est survenue pendant l’envoi.' });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '4mb' } } };
