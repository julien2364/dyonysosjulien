const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  try {
    const { objet = '', organisation = '', nom = '', prenom = '', message = '', email = '', telephone = '', website = '' } = req.body || {};
    if (website) return res.status(200).json({ ok: true });
    if (!email.trim() || !telephone.trim() || !message.trim()) return res.status(400).json({ error: 'Email, téléphone et message sont obligatoires.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) return res.status(400).json({ error: 'Adresse email invalide.' });
    if (telephone.length > 40 || message.length > 5000 || objet.length > 180 || organisation.length > 150 || nom.length > 100 || prenom.length > 100) return res.status(400).json({ error: 'Un champ dépasse la longueur autorisée.' });
    if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Service d’envoi temporairement indisponible.' });
    const subject = `Message du site dyonysos.fr — ${objet.trim() || 'Demande de contact'}`;
    const html = `<h2>Nouveau message depuis dyonysos.fr</h2><p><strong>Objet :</strong> ${escapeHtml(objet || 'Non précisé')}</p><p><strong>Organisation :</strong> ${escapeHtml(organisation || 'Non précisée')}</p><p><strong>Nom :</strong> ${escapeHtml(nom || 'Non précisé')}</p><p><strong>Prénom :</strong> ${escapeHtml(prenom || 'Non précisé')}</p><p><strong>Email :</strong> ${escapeHtml(email)}</p><p><strong>Téléphone :</strong> ${escapeHtml(telephone)}</p><hr><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`;
    const domain = String(process.env.RESEND_EMAIL_DOMAIN || 'dyonysos.fr').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const payload = { from: `Dyonysos <contact@${domain}>`, to: [process.env.CONTACT_TO || 'julien.daures@gmail.com'], reply_to: email, subject, html };
    let response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    let resendError = response.ok ? '' : await response.text();
    if (!response.ok) {
      payload.from = 'Dyonysos <onboarding@resend.dev>';
      response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    if (!response.ok) { resendError += ` | fallback: ${await response.text()}`; console.error('Resend contact error:', resendError); return res.status(502).json({ error: 'Le message n’a pas pu être envoyé. Merci de réessayer ultérieurement.' }); }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Une erreur est survenue pendant l’envoi.' });
  }
};
