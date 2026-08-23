// Registre complet des projets Dyonysos — alimente l'onglet "Projets" de /espace-prive.
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const categories = [...new Set(PROJECTS.map(p => p.categorie))];
  const parCategorie = categories.map(cat => ({
    categorie: cat,
    projets: PROJECTS.filter(p => p.categorie === cat)
  }));

  const urgents = PROJECTS.filter(p => p.priorite && p.priorite.startsWith('urgent')).map(p => ({ name: p.name, priorite: p.priorite }));

  return res.status(200).json({
    updatedAt: '2026-08-23',
    total: PROJECTS.length,
    urgents,
    parCategorie,
    projets: PROJECTS
  });
};
