const { requireSession } = require('../../../_lib/session');
const { readRows, appendRow, updateCell, rowNumberFromIndex } = require('../../../_lib/sheets');
const {
  SHEET_MANUAL_REQUESTS, MANUAL_REQUESTS_RANGE, MANUAL_REQUESTS_COLS,
  SHEET_CONTENT_IDEAS, CONTENT_IDEAS_COLS, rowToObject, objectToRow,
} = require('../../../_lib/schema');
const { runScenario } = require('../../../_lib/make');

function columnLetterFromIndex(index) {
  let n = index + 1;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;

  try {
    const requestId = req.query.id;
    const rows = await readRows(SHEET_MANUAL_REQUESTS, MANUAL_REQUESTS_RANGE);
    const requests = rows.map((row, index) => ({
      ...rowToObject(row, MANUAL_REQUESTS_COLS),
      _row: rowNumberFromIndex(index),
    }));
    const row = requests.find((r) => r.request_id === requestId);
    if (!row) return res.status(404).json({ error: 'not_found', message: `Demande introuvable: ${requestId}` });
    if (row.status !== 'PENDING_REVIEW') return res.status(409).json({ error: 'Déjà traité' });

    const statusColumn = columnLetterFromIndex(MANUAL_REQUESTS_COLS.status);
    const approvedAtColumn = columnLetterFromIndex(MANUAL_REQUESTS_COLS.approved_at);
    await updateCell(SHEET_MANUAL_REQUESTS, statusColumn, row._row, 'APPROVED');
    await updateCell(SHEET_MANUAL_REQUESTS, approvedAtColumn, row._row, new Date().toISOString());

    const idea = {
      idea_id: 'IDEA-' + row.project_id + '-' + Date.now(),
      project_id: row.project_id,
      created_at: new Date().toISOString(),
      status: 'IDEA',
      source: 'MANUAL',
      origin: 'MANUAL',
      source_link: row.source_link,
      requested_channel: row.channel,
      requested_by: row.requested_by,
      manual_request_id: row.request_id,
    };
    await appendRow(SHEET_CONTENT_IDEAS, objectToRow(idea, CONTENT_IDEAS_COLS));

    let make_triggered = false;
    let make_error = null;
    try {
      await runScenario('B_GENERATOR');
      make_triggered = true;
    } catch (makeErr) {
      make_error = String(makeErr.message || makeErr);
    }

    return res.status(200).json({ ok: true, idea_created: true, make_triggered, ...(make_triggered ? {} : { make_error }) });
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      return res.status(501).json({ error: 'not_configured', message: err.message });
    }
    return res.status(500).json({ error: 'server_error', message: String(err.message || err) });
  }
};
