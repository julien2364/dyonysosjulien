// Registre complet des projets Dyonysos — alimente l'onglet "Projets" de /espace-prive.
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');
const { SUIVI_PROJETS } = require('./_lib/suivi-projets');
const { PROJECT_LINKS } = require('./_lib/project-links');
const { getAvancementPortefeuille } = require('./_lib/taiga-client');

// Correspondance entre le nom de projet tel qu'écrit dans Pilotage-des-projets.xlsx (onglet "Suivi",
// fichier réel de Julien) et le nom utilisé dans ce registre — les deux sources existaient séparément,
// ce mapping les relie sans renommer ni fusionner les données d'origine.
const SUIVI_NAME_MAP = {
  'École Connect': 'École Connect',
  'CoursHub': 'CoursHub',
  'QuizPlay': 'QuizPlay',
  'Marketplace-Sharetribe-Clone': 'Marketplace-Sharetribe-Clone',
  'Nova ERP Web': 'NOVA ERP WEB (clone Odoo Website & eCommerce)',
  'Vinted remake (Frip\')': 'Frip (Vinted remake)',
  'Mym ++': 'Mym++ / Tinder++',
  'Tinder ++': 'Mym++ / Tinder++',
};

function buildSuiviParProjet() {
  const groupes = {};
  SUIVI_PROJETS.forEach((r) => {
    const registryName = SUIVI_NAME_MAP[r.projet] || r.projet;
    if (!groupes[registryName]) groupes[registryName] = { registryName, sourceNoms: new Set(), lignes: [], statuts: {} };
    groupes[registryName].sourceNoms.add(r.projet);
    groupes[registryName].lignes.push(r);
    groupes[registryName].statuts[r.statut] = (groupes[registryName].statuts[r.statut] || 0) + 1;
  });
  return Object.values(groupes).map((g) => ({
    registryName: g.registryName,
    sourceNoms: [...g.sourceNoms],
    total: g.lignes.length,
    statuts: g.statuts,
    lignes: g.lignes,
  }));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  // Avancement live (Taiga) — mêmes données que KPI/Finance/Stratégie, priorité sur les fiches
  // "Suivi" statiques ci-dessous quand un projet Taiga réel est rapproché.
  const avancement = await getAvancementPortefeuille(PROJECTS.map((p) => p.name));

  const categories = [...new Set(PROJECTS.map(p => p.categorie))];
  const parCategorie = categories.map(cat => ({
    categorie: cat,
    projets: PROJECTS.filter(p => p.categorie === cat)
  }));

  const urgents = PROJECTS.filter(p => p.priorite && p.priorite.startsWith('urgent')).map(p => ({ name: p.name, priorite: p.priorite }));

  return res.status(200).json({
    updatedAt: '2026-08-24',
    avancement,
    total: PROJECTS.length,
    urgents,
    parCategorie,
    projets: PROJECTS,
    // Backlog granulaire réel importé le 24/08/2026 depuis Pilotage-des-projets.xlsx (onglet "Suivi",
    // fichier de Julien dans /Users/juliendaures/Claude/Pilotage/) — 525 lignes réelles, jusqu'à la
    // tâche/fonctionnalité précise, pas juste un résumé. Rattaché au projet du registre par nom quand
    // possible (voir SUIVI_NAME_MAP) ; sinon affiché sous son propre nom.
    suiviGranulaire: {
      note: 'Détail tâche par tâche réel, importé de Pilotage-des-projets.xlsx (onglet Suivi) — pas un résumé recalculé. 8 projets couverts pour l\'instant : Nova ERP Web, École Connect, CoursHub, Mym++, Marketplace-Sharetribe-Clone, QuizPlay, Vinted remake (Frip\'), Tinder++. Les autres projets du portefeuille (CVDesignPro, Pet Stone, Firmoscope/Prospeo, Arbitrage+/Analyzer+/Profit+…) n\'ont pas de fichier Suivi équivalent trouvé — leur détail reste celui du champ taches[] du registre.',
      totalLignes: SUIVI_PROJETS.length,
      parProjet: buildSuiviParProjet(),
    },
    liensOdooTaiga: PROJECT_LINKS,
  });
};
