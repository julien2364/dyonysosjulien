const crypto = require('crypto');
const {
  readRows,
  listSheetTitles,
  ensureSheetExists,
  appendRow,
  updateRowRange,
  rowNumberFromIndex,
} = require('./sheets');

const SHEET = 'CRM_PIPELINE';
const HEADER = ['id', 'project_id', 'company', 'contact_name', 'contact_email', 'stage', 'amount_eur', 'next_action', 'due_at', 'owner', 'source', 'updated_at'];
const STAGES = ['nouveau', 'qualifie', 'demo', 'proposition', 'gagne', 'perdu'];

function rowToOpportunity(row) {
  return {
    id: row[0] || '', projectId: row[1] || '', company: row[2] || '', contactName: row[3] || '',
    contactEmail: row[4] || '', stage: row[5] || 'nouveau', amountEur: Number(row[6] || 0),
    nextAction: row[7] || '', dueAt: row[8] || '', owner: row[9] || '', source: row[10] || '', updatedAt: row[11] || '',
  };
}

async function getPipeline() {
  const titles = await listSheetTitles();
  if (!titles.includes(SHEET)) return { ready: false, opportunities: [] };
  const rows = await readRows(SHEET, 'A1:L');
  return { ready: true, opportunities: rows.filter((row) => row[0]).map(rowToOpportunity) };
}

async function ensurePipeline() {
  await ensureSheetExists(SHEET, HEADER);
  return getPipeline();
}

async function upsertOpportunity(input) {
  await ensureSheetExists(SHEET, HEADER);
  const rows = await readRows(SHEET, 'A1:L');
  const id = String(input.id || crypto.randomUUID());
  const stage = STAGES.includes(input.stage) ? input.stage : 'nouveau';
  const updatedAt = new Date().toISOString();
  const values = [
    id, String(input.projectId || ''), String(input.company || ''), String(input.contactName || ''),
    String(input.contactEmail || ''), stage, Number(input.amountEur || 0), String(input.nextAction || ''),
    String(input.dueAt || ''), String(input.owner || ''), String(input.source || ''), updatedAt,
  ];
  const index = rows.findIndex((row) => row[0] === id);
  if (index === -1) await appendRow(SHEET, values);
  else await updateRowRange(SHEET, rowNumberFromIndex(index), 'A', 'L', values);
  return rowToOpportunity(values);
}

module.exports = { SHEET, STAGES, getPipeline, ensurePipeline, upsertOpportunity };
