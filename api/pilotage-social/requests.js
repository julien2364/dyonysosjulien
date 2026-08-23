const { requireSession } = require('../_lib/session');
const { readRows, appendRow } = require('../_lib/sheets');
const {
  SHEET_MANUAL_REQUESTS, MANUAL_REQUESTS_RANGE, MANUAL_REQUESTS_COLS,
  rowToObject, objectToRow,
} = require('../_lib/schema');

module.exports = async function handler(req, res) {
  if (!requireSession(req, res)) return;

  try {
    if (req.method === 'GET') {
      const rows = await readRows(SHEET_MANUAL_REQUESTS, MANUAL_REQUESTS_RANGE);
      const requests = rows.map((row) => rowToObject(row, MANUAL_REQUESTS_COLS)).filter((r) => r.request_id);
      res.setHeader('Cache-Control', 'private, no-store');
      return res.status(200).json({ requests });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const { project_id, channel, source_link, note_utilisateur, requested_by } = body;
      if (!project_id || !channel || !source_link) {
        return res.status(400).json({ error: 'project_id, channel et source_link sont requis.' });
      }
      const requestId = 'REQ-' + Date.now();
      const row = {
        request_id: requestId,
        project_id,
        channel,
        source_link,
        note_utilisateur: note_utilisateur || '',
        requested_by: requested_by || 'julien',
        requested_at: new Date().toISOString(),
        status: 'PENDING_REVIEW',
      };
      await appendRow(SHEET_MANUAL_REQUESTS, objectToRow(row, MANUAL_REQUESTS_COLS));
      return res.status(201).json({ ok: true, request_id: requestId });
    }

    return res.status(405).json({ error: 'Méthode non autorisée.' });
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      return res.status(501).json({ error: 'not_configured', message: err.message, requests: [] });
    }
    return res.status(500).json({ error: 'server_error', message: String(err.message || err) });
  }
};
