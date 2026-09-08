const fs = require('fs');
const path = require('path');
const { validSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/portfolio-pilotage');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

module.exports = function handler(req, res) {
  const slug = String(req.query.slug || '');
  if (req.method !== 'GET') return res.status(405).send('Méthode non autorisée.');
  if (!validSession(req)) {
    res.setHeader('Cache-Control', 'private, no-store');
    return res.redirect(302, `/espace-prive?next=/pilotage-${encodeURIComponent(slug)}`);
  }
  const project = PROJECTS.find((item) => item.slug === slug);
  if (!project) return res.status(404).send('Pilotage introuvable.');
  const template = fs.readFileSync(path.join(process.cwd(), 'api', '_templates', 'pilotage-project.html'), 'utf8');
  const page = template.replaceAll('{{PROJECT_NAME}}', escapeHtml(project.name)).replaceAll('{{PROJECT_SLUG}}', escapeHtml(project.slug));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).send(page);
};
