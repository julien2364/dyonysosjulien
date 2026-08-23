// KPI — vue chiffrée d'ensemble, alimente l'onglet "KPI" de /espace-prive.
// Portefeuille : calculé en direct depuis le registre (api/_lib/registry.js).
// Trafic : snapshot RÉEL tiré de Vercel Web Analytics le 23/08/2026 (via le compte Vercel de Julien,
// équipe Dyonysos) — pas un accès live depuis le site en production (il faudrait un VERCEL_API_TOKEN
// en variable d'environnement + le code d'appel API Vercel ; voir note "commentPasserEnLive" ci-dessous).
// Rien n'est extrapolé au-delà de ce que l'API Vercel a renvoyé.
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');
const { TRAFIC_SNAPSHOT } = require('./_lib/kpi-data');
const { getTotaux } = require('./_lib/finance-data');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const total = PROJECTS.length;
  const actifs = PROJECTS.filter(p => p.url).length;
  const avecGithub = PROJECTS.filter(p => p.github).length;
  const avecDrive = PROJECTS.filter(p => p.drive).length;
  const avecLocal = PROJECTS.filter(p => p.local).length;
  const aNettoyer = PROJECTS.filter(p => p.categorie === 'À nettoyer').length;
  const aIdentifier = PROJECTS.filter(p => p.categorie === 'À identifier').length;
  const urgents = PROJECTS.filter(p => p.priorite && p.priorite.startsWith('urgent')).map(p => ({ name: p.name, priorite: p.priorite }));

  const parCategorie = {};
  PROJECTS.forEach(p => { parCategorie[p.categorie] = (parCategorie[p.categorie] || 0) + 1; });

  return res.status(200).json({
    updatedAt: '2026-08-23',
    portefeuille: { total, actifs, avecGithub, avecDrive, avecLocal, aNettoyer, aIdentifier, parCategorie, urgents },
    trafic: TRAFIC_SNAPSHOT,
    indexation: {
      configured: false,
      note: 'Pas encore d’accès API Search Console — voici les alertes reçues par email, en attendant.',
      alertesRecentes: [
        { date: '2026-08-19', site: 'dyonysos.fr', sujet: 'Page en double sans URL canonique' },
        { date: '2026-08-17', site: 'dyonysos.fr', sujet: 'Page en double + balise — nouveau motif sur le sitemap' },
      ],
    },
    finance: { configured: true, note: 'Voir l’onglet Finance — total retenu calculé sur ~1 semaine de transactions Qonto réelles, pas un KPI mensuel stabilisé. Compte Stripe créé le 12-18/08, premier produit récurrent le 17/08 — clé API pas encore fournie.' },
    couts: (() => {
      const { total: totalGlobal, parFournisseur } = getTotaux();
      return {
        totalGlobal,
        parFournisseur,
        parProjet: {},
        note: 'Coût global et par fournisseur = mêmes chiffres réels que l’onglet Finance (source Qonto, ~1 semaine d’historique). Le détail par projet reste vide tant que les dépenses ne sont pas taguées à un projet.',
      };
    })(),
    domaine: { nom: 'dyonysos.fr', registrar: 'IONOS', renouvellement: 'Prolongé avec succès (confirmation email du 20/08/2026)' },
  });
};
