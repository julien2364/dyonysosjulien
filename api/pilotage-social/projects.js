const { requireSession } = require('../_lib/session');
const { readRows } = require('../_lib/sheets');
const { SHEET_PROJECTS, PROJECTS_RANGE, PROJECTS_COLS, rowToObject } = require('../_lib/schema');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;

  try {
    const rows = await readRows(SHEET_PROJECTS, PROJECTS_RANGE);
    const projects = rows
      .map((row) => rowToObject(row, PROJECTS_COLS))
      .filter((p) => p.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        statut: p.statut,
        site_url: p.site_url,
        canaux: String(p.canaux || '')
          .split(',')
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
      }));
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ projects });
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') {
      return res.status(501).json({ error: 'not_configured', message: err.message, projects: [] });
    }
    return res.status(500).json({ error: 'server_error', message: String(err.message || err) });
  }
};
