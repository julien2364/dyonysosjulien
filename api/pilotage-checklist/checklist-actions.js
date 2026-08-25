// Écriture des items de la check-list (statut / lien document / note) et des deux champs libres
// "points d'amélioration" / "points critiques" par projet — ajouté le 25/08/2026. Écrit dans l'onglet
// CHECKLIST du classeur Content Engine, créé automatiquement au premier appel (voir
// _lib/sheets.js ensureSheetExists) : Julien n'a rien à préparer côté Google Sheets.
const { requireSession } = require('../_lib/session');
const { readRows, appendRow, updateRowRange, ensureSheetExists, rowNumberFromIndex } = require('../_lib/sheets');
const { SHEET_CHECKLIST, CHECKLIST_COLS, CHECKLIST_RANGE, CHECKLIST_HEADER } = require('../_lib/schema');
const { PROJECTS } = require('../_lib/registry');
const { STATUTS, allItemIds, CHAMPS_LIBRES } = require('../_lib/checklist-data');

const VALID_ITEM_IDS = new Set([...allItemIds(), ...CHAMPS_LIBRES.map((c) => c.id)]);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const { projectId, itemId, statut, document_url, note } = req.body || {};
  if (!projectId || !itemId) return res.status(400).json({ error: 'projectId et itemId requis.' });
  if (!PROJECTS.some((p) => p.name === projectId)) return res.status(404).json({ error: `Projet "${projectId}" introuvable dans le registre.` });
  if (!VALID_ITEM_IDS.has(itemId)) return res.status(400).json({ error: `itemId "${itemId}" inconnu du référentiel check-list.` });
  const isChampLibre = itemId.startsWith('_');
  const statutFinal = isChampLibre ? '' : (statut || 'a_faire');
  if (!isChampLibre && !STATUTS.includes(statutFinal)) {
    return res.status(400).json({ error: `statut "${statutFinal}" invalide (attendus : ${STATUTS.join(', ')}).` });
  }

  try {
    await ensureSheetExists(SHEET_CHECKLIST, CHECKLIST_HEADER);
    const rows = await readRows(SHEET_CHECKLIST, CHECKLIST_RANGE);
    const idx = rows.findIndex((row) => row[CHECKLIST_COLS.project_id] === projectId && row[CHECKLIST_COLS.item_id] === itemId);
    const updatedAt = new Date().toISOString();
    const values = [statutFinal, document_url || '', note || '', updatedAt];
    if (idx === -1) {
      await appendRow(SHEET_CHECKLIST, [projectId, itemId, ...values]);
    } else {
      const rowNumber = rowNumberFromIndex(idx);
      await updateRowRange(SHEET_CHECKLIST, rowNumber, 'C', 'F', values);
    }
    return res.status(200).json({ ok: true, projectId, itemId, statut: statutFinal, document_url: document_url || '', note: note || '' });
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      return res.status(501).json({ error: 'not_configured', message: err.message });
    }
    return res.status(502).json({ error: err.message || String(err) });
  }
};
