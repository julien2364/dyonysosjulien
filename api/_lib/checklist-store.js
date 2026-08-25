// Lecture des données enregistrées de l'onglet Check-list (feuille CHECKLIST du classeur Content
// Engine) — ajouté le 25/08/2026. Ne lève jamais pour "feuille pas encore créée" : tant qu'aucun
// enregistrement n'a eu lieu, la feuille n'existe pas encore (voir checklist-actions.js qui la crée
// au premier POST) et on renvoie simplement une map vide, comme pour les autres sources du dashboard
// qui restent utilisables tant que le branchement n'est pas encore fait.
const { readRows, listSheetTitles } = require('./sheets');
const { SHEET_CHECKLIST, CHECKLIST_COLS, CHECKLIST_RANGE } = require('./schema');

function keyOf(projectId, itemId) {
  return `${projectId}::${itemId}`;
}

// Renvoie { map, sheetExists } — map indexée par "projectId::itemId" -> { statut, document_url, note, updated_at }
async function getChecklistMap() {
  const map = {};
  let sheetExists = false;
  try {
    const titles = await listSheetTitles();
    sheetExists = titles.includes(SHEET_CHECKLIST);
    if (!sheetExists) return { map, sheetExists };
    const rows = await readRows(SHEET_CHECKLIST, CHECKLIST_RANGE);
    rows.forEach((row) => {
      const projectId = row[CHECKLIST_COLS.project_id];
      const itemId = row[CHECKLIST_COLS.item_id];
      if (!projectId || !itemId) return;
      map[keyOf(projectId, itemId)] = {
        statut: row[CHECKLIST_COLS.statut] || 'a_faire',
        document_url: row[CHECKLIST_COLS.document_url] || '',
        note: row[CHECKLIST_COLS.note] || '',
        updated_at: row[CHECKLIST_COLS.updated_at] || '',
      };
    });
    return { map, sheetExists };
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') throw err; // remonté tel quel — Google Sheets pas branché du tout
    // Feuille illisible pour une autre raison (rare) : on ne casse pas tout l'onglet pour ça.
    return { map, sheetExists };
  }
}

module.exports = { getChecklistMap, keyOf };
