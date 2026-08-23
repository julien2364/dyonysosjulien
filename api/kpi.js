// KPI — vue chiffrée d'ensemble, alimente l'onglet "KPI" de /espace-prive.
// Portefeuille : calculé en direct depuis le registre (api/_lib/registry.js).
// Trafic : snapshot RÉEL tiré de Vercel Web Analytics le 23/08/2026 (via le compte Vercel de Julien,
// équipe Dyonysos) — pas un accès live depuis le site en production (il faudrait un VERCEL_API_TOKEN
// en variable d'environnement + le code d'appel API Vercel ; voir note "commentPasserEnLive" ci-dessous).
// Rien n'est extrapolé au-delà de ce que l'API Vercel a renvoyé.
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');

// Snapshot réel Vercel Web Analytics, capturé le 23/08/2026 (team Dyonysos team_V2XarT2PcWGD86aDLfpoA5xa).
const TRAFIC_SNAPSHOT = {
  capturedAt: '2026-08-23',
  parProjet: [
    { name: 'dyonysos.fr (site principal)', vercelProjectId: 'prj_9GUpX7bWsEM6JFXXOKMgf6dwE4EQ', periodes: { '1j': { visiteurs: 5, pageviews: 12 }, '7j': { visiteurs: 32, pageviews: 92 }, '30j': { visiteurs: 86, pageviews: 969 }, '60j': { visiteurs: 86, pageviews: 969 } }, pays30j: [
      { pays: 'US', visiteurs: 42, pageviews: 633 }, { pays: 'BE', visiteurs: 31, pageviews: 303 }, { pays: 'IE', visiteurs: 2, pageviews: 4 },
      { pays: 'RO', visiteurs: 2, pageviews: 2 }, { pays: 'SE', visiteurs: 2, pageviews: 3 }, { pays: 'BR', visiteurs: 1, pageviews: 3 },
      { pays: 'FR', visiteurs: 1, pageviews: 4 }, { pays: 'PT', visiteurs: 1, pageviews: 5 }, { pays: 'SG', visiteurs: 1, pageviews: 2 },
    ], note: 'Historique de données limité à ~15-16 jours (30j et 60j identiques) — le suivi Web Analytics est récent, pas un mois plein de recul.' },
    { name: 'CVDesignPro', vercelProjectId: 'prj_sbz1BpKKEmUMe1qLASFYIFahRxKA', periodes: { '30j': { visiteurs: 660, pageviews: 6592 } }, note: 'Trafic le plus important du portefeuille, de loin.' },
    { name: 'Analyzer+', vercelProjectId: 'prj_B1jt5DLJiQ9wqKiP0UJz2V0kU4rG', periodes: { '30j': { visiteurs: 49, pageviews: 120 } } },
    { name: 'Profit+', vercelProjectId: 'prj_hTcxKWwRPCATVgMAiEDlrh2hev6Q', periodes: { '30j': { visiteurs: 30, pageviews: 50 } } },
    { name: 'Arbitrage+', vercelProjectId: 'prj_YNDpcwcBx3TfwNUF3TFDpTF6U8YJ', periodes: { '30j': { visiteurs: 0, pageviews: 0 } }, note: 'Web Analytics non actif ou trafic nul sur la période.' },
    { name: 'École Connect', vercelProjectId: 'prj_6t8rABLHNlvQb0sUMb0gT55P50E7', periodes: { '30j': { visiteurs: 0, pageviews: 0 } } },
    { name: 'Firmoscope / Prospeo', vercelProjectId: 'prj_iTUKEu3BUVEGJpxm9nS0Km7vjIUs', periodes: { '30j': { visiteurs: 0, pageviews: 0 } } },
  ],
  commentPasserEnLive: 'Pour que ce tableau se mette à jour tout seul (au lieu d’un instantané que je recapture manuellement) : créer un token API Vercel (scope lecture Web Analytics, équipe Dyonysos) et l’ajouter en variable d’environnement VERCEL_API_TOKEN sur le projet dyonysos-site, puis je branche l’appel direct depuis cette route.',
};

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
    domaine: { nom: 'dyonysos.fr', registrar: 'IONOS', renouvellement: 'Prolongé avec succès (confirmation email du 20/08/2026)' },
  });
};
