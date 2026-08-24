// Écriture des identifiants réseaux sociaux par projet (LinkedIn/Facebook/Instagram/TikTok/YouTube)
// dans l'onglet PROJECTS du classeur Content Engine — ajouté le 24/08/2026 à la demande de Julien :
// "il faudra renseigner tous les liens des réseaux sociaux pour chaque projet [...] et piloter
// l'automatisation à partir de ces liens, id ou autre". Ces mêmes colonnes (li_org_urn, fb_page_id,
// instagram_account_id, tiktok_account_id, youtube_channel_id) sont déjà lues directement par les
// scénarios Make — écrire ici revient donc à piloter l'automatisation, pas juste l'affichage.
const { requireSession } = require('../_lib/session');
const { readRows, updateCell, rowNumberFromIndex, columnLetterFromIndex } = require('../_lib/sheets');
const { SHEET_PROJECTS, PROJECTS_RANGE, PROJECTS_COLS } = require('../_lib/schema');

const ALLOWED_FIELDS = ['li_org_urn', 'fb_page_id', 'instagram_account_id', 'tiktok_account_id', 'youtube_channel_id'];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const { projectId, field, value } = req.body || {};
  if (!projectId || !field) return res.status(400).json({ error: 'projectId et field requis.' });
  if (!ALLOWED_FIELDS.includes(field)) {
    return res.status(400).json({ error: `champ non autorisé : ${field} (autorisés : ${ALLOWED_FIELDS.join(', ')})` });
  }

  try {
    const rows = await readRows(SHEET_PROJECTS, PROJECTS_RANGE);
    const idx = rows.findIndex((row) => row[PROJECTS_COLS.id] === projectId);
    if (idx === -1) return res.status(404).json({ error: `Projet id=${projectId} introuvable dans PROJECTS.` });
    const rowNumber = rowNumberFromIndex(idx);
    const colLetter = columnLetterFromIndex(PROJECTS_COLS[field]);
    await updateCell(SHEET_PROJECTS, colLetter, rowNumber, value || '');
    return res.status(200).json({ ok: true, projectId, field, value: value || '' });
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      return res.status(501).json({ error: 'not_configured', message: err.message });
    }
    return res.status(502).json({ error: err.message || String(err) });
  }
};
