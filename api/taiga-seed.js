// Seed en masse de Taiga depuis le registre de projets — ajouté le 24/08/2026 sur demande de Julien :
// "Cherche les tâches en cours de chaque projet et go". Source des tâches : le champ taches[] de
// chaque projet dans api/_lib/registry.js (le seul endroit où les tâches en cours sont documentées
// de façon homogène pour l'ensemble du portefeuille — le détail plus fin de suivi-projets.js, pour
// les 8 projets qui en ont un, n'est pas encore utilisé ici, à ajouter dans un second temps si utile).
//
// Sécurité : par défaut dryRun=true — ne fait AUCUNE écriture, renvoie juste le plan (quels projets
// Taiga seraient créés, avec combien de tâches). Ne passe en écriture réelle que si dryRun=false est
// explicitement envoyé — pour respecter "montre avant de réaliser".
// Idempotent : un projet dont le nom existe déjà côté Taiga est sauté (jamais de doublon).
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');
const { PROJECT_LINKS } = require('./_lib/project-links');
const { isTaigaConfigured, listMyProjectsRaw, createProject, createUserStory } = require('./_lib/taiga-client');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  if (!isTaigaConfigured()) {
    return res.status(400).json({ error: 'Taiga non configuré (TAIGA_USERNAME/TAIGA_PASSWORD manquants côté Vercel).' });
  }

  const dryRun = req.body?.dryRun !== false; // true par défaut

  // Ne considère que les projets marqués taigaEligible=true par l'analyse du 24/08/2026, et qui ont
  // au moins une tâche réelle documentée dans le registre (rien à créer sinon).
  const candidats = PROJECTS
    .filter((p) => PROJECT_LINKS[p.name]?.taigaEligible && Array.isArray(p.taches) && p.taches.length)
    .map((p) => ({ name: p.name, description: p.etat || '', taches: p.taches }));

  try {
    const existants = await listMyProjectsRaw();
    const existantsNoms = new Set(existants.map((p) => p.name));
    const aCreer = candidats.filter((c) => !existantsNoms.has(c.name));
    const dejaPresents = candidats.filter((c) => existantsNoms.has(c.name)).map((c) => c.name);

    if (dryRun) {
      return res.status(200).json({
        dryRun: true,
        totalCandidats: candidats.length,
        aCreer: aCreer.map((c) => ({ name: c.name, nbTaches: c.taches.length })),
        dejaPresents,
        note: 'Aucune écriture effectuée — renvoie POST avec {"dryRun":false} pour créer réellement ces projets et leurs tâches dans Taiga.',
      });
    }

    const resultats = [];
    for (const c of aCreer) {
      try {
        const projet = await createProject(c.name, c.description);
        const taches = [];
        for (const t of c.taches) {
          try {
            await createUserStory(projet.id, t, '');
            taches.push({ titre: t, ok: true });
          } catch (err) {
            taches.push({ titre: t, ok: false, error: err.message || String(err) });
          }
        }
        resultats.push({ name: c.name, ok: true, taigaId: projet.id, slug: projet.slug, taches });
      } catch (err) {
        resultats.push({ name: c.name, ok: false, error: err.message || String(err) });
      }
    }

    return res.status(200).json({ dryRun: false, crees: resultats, dejaPresents });
  } catch (err) {
    return res.status(502).json({ error: err.message || String(err) });
  }
};
