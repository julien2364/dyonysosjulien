const { requireSession } = require('../_lib/session');
const { readRows } = require('../_lib/sheets');
const {
  SHEET_PUBLICATION_LOG, PUBLICATION_LOG_RANGE, PUBLICATION_LOG_COLS,
  SHEET_CONTENT_QUEUE, CONTENT_QUEUE_RANGE, CONTENT_QUEUE_COLS,
  rowToObject,
} = require('../_lib/schema');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;

  try {
    const [logRows, queueRows] = await Promise.all([
      readRows(SHEET_PUBLICATION_LOG, PUBLICATION_LOG_RANGE),
      readRows(SHEET_CONTENT_QUEUE, CONTENT_QUEUE_RANGE),
    ]);

    const logs = logRows.map((row) => rowToObject(row, PUBLICATION_LOG_COLS)).filter((l) => l.log_id);
    const queue = queueRows.map((row) => rowToObject(row, CONTENT_QUEUE_COLS)).filter((c) => c.content_id);

    const published = logs.filter((l) => l.status === 'SUCCESS' || l.status === 'PUBLISHED').length;
    const failed = logs.filter((l) => l.status === 'FAILED' || l.status === 'ERROR').length;
    const total = logs.length;
    const successRate = total > 0 ? Math.round((published / total) * 100) : null;

    const failedLogs = logs.filter((l) => l.status === 'FAILED' || l.status === 'ERROR');
    const blockedQueue = queue.filter((c) => c.status === 'FAILED' || c.status === 'REVIEW');

    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({
      summary: { total, published, failed, successRate },
      failedLogs,
      blockedQueue,
    });
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      return res.status(501).json({
        error: 'not_configured', message: err.message,
        summary: { total: 0, published: 0, failed: 0, successRate: null },
        failedLogs: [], blockedQueue: [],
      });
    }
    return res.status(500).json({ error: 'server_error', message: String(err.message || err) });
  }
};
