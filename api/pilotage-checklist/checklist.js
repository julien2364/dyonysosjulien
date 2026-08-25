// Onglet "Check-list" — ajouté le 25/08/2026 à la demande de Julien : un référentiel générique
// (avant lancement / démarrage / pilotage & montée en puissance) appliqué à chaque projet du
// registre, avec statut/document/note par item, plus deux champs libres "points d'amélioration" et
// "points critiques" par projet. Voir api/_lib/checklist-data.js pour le contenu du référentiel et
// api/_lib/checklist-store.js pour la lecture des données déjà enregistrées.
const { requireSession } = require('../_lib/session');
const { PROJECTS } = require('../_lib/registry');
const { PHASES, STATUTS, STATUT_LABELS, CHAMPS_LIBRES } = require('../_lib/checklist-data');
const { getChecklistMap, keyOf } = require('../_lib/checklist-store');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  let map = {}, sheetExists = false, sheetsConfigure = true;
  try {
    const r = await getChecklistMap();
    map = r.map; sheetExists = r.sheetExists;
  } catch (err) {
    if (err.code === 'NOT_CONFIGURED') { sheetsConfigure = false; } else { throw err; }
  }

  const projets = PROJECTS.map((p) => {
    const phases = {};
    PHASES.forEach((ph) => {
      let fait = 0, enCours = 0, nonApplicable = 0, total = 0;
      ph.categories.forEach((c) => c.items.forEach((it) => {
        total++;
        const entry = map[keyOf(p.name, it.id)];
        const statut = entry ? entry.statut : 'a_faire';
        if (statut === 'fait') fait++;
        else if (statut === 'en_cours') enCours++;
        else if (statut === 'non_applicable') nonApplicable++;
      }));
      phases[ph.key] = { fait, enCours, nonApplicable, total, aFaire: total - fait - enCours - nonApplicable };
    });
    const items = {};
    PHASES.forEach((ph) => ph.categories.forEach((c) => c.items.forEach((it) => {
      const entry = map[keyOf(p.name, it.id)];
      if (entry) items[it.id] = entry;
    })));
    const amelioEntry = map[keyOf(p.name, '_AMELIORATIONS')];
    const critEntry = map[keyOf(p.name, '_CRITIQUES')];
    return {
      name: p.name, categorie: p.categorie, priorite: p.priorite || null, url: p.url || null, etat: p.etat || null,
      phases, items,
      ameliorations: amelioEntry ? amelioEntry.note : '',
      critiques: critEntry ? critEntry.note : '',
    };
  });

  const categories = [...new Set(PROJECTS.map((p) => p.categorie))];
  const parCategorie = categories.map((cat) => ({ categorie: cat, projets: projets.filter((p) => p.categorie === cat) }));

  return res.status(200).json({
    sheetsConfigure,
    checklistSheetReady: sheetExists,
    referentiel: { phases: PHASES, statuts: STATUTS, statutLabels: STATUT_LABELS, champsLibres: CHAMPS_LIBRES },
    total: PROJECTS.length,
    parCategorie,
  });
};
