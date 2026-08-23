// Snapshot réel Vercel Web Analytics, capturé le 23/08/2026 (team Dyonysos team_V2XarT2PcWGD86aDLfpoA5xa).
// Extrait de api/kpi.js pour être partagé sans duplication avec d'autres modules (Stratégie, Finance)
// qui ont besoin des mêmes chiffres de trafic réel plutôt que de les recopier à la main.
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

module.exports = { TRAFIC_SNAPSHOT };
