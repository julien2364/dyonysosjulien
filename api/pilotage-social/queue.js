const { requireSession } = require('../_lib/session');
const { readRows } = require('../_lib/sheets');
const { SHEET_CONTENT_QUEUE, CONTENT_QUEUE_RANGE, CONTENT_QUEUE_COLS, rowToObject } = require('../_lib/schema');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;

  try {
    const rows = await readRows(SHEET_CONTENT_QUEUE, CONTENT_QUEUE_RANGE);
    const items = rows
      .map((row) => rowToObject(row, CONTENT_QUEUE_COLS))
      .filter((c) => c.content_id)
      .map((c) => ({
        content_id: c.content_id,
        project_id: c.project_id,
        channel: c.channel,
        hook: c.hook,
        body: c.body,
        cta: c.cta,
        url: c.url,
        hashtags: c.hashtags,
        scheduled_at: c.scheduled_at,
        status: c.status,
      }));
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ items });
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      return res.status(501).json({ error: 'not_configured', message: err.message, items: [] });
    }
    return res.status(500).json({ error: 'server_error', message: String(err.message || err) });
  }
};
