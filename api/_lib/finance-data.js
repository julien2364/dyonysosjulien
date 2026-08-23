// Dépenses réelles du portefeuille — extrait de api/finance.js pour être partagé sans duplication
// avec d'autres modules (KPI, Stratégie) qui ont besoin des mêmes coûts réels.
// Source : transactions réelles trouvées dans les emails de notification Qonto (support@qonto.com,
// "Vous avez effectué un paiement") sur la boîte julien.daures@gmail.com, vérifiées le 23/08/2026.
// La carte Qonto "One" utilisée est récente (première transaction le 12-13/08/2026) : l'historique
// ne couvre donc qu'environ une semaine, pas un mois plein. Rien n'est extrapolé ni estimé.
const DEPENSES = [
  { date: '2026-08-12', fournisseur: 'ChatGPT', montant: 99.53, devise: 'EUR', note: null },
  { date: '2026-08-15', fournisseur: 'Keepa', montant: 49.00, devise: 'EUR', note: 'Outil de suivi de prix Amazon' },
  { date: '2026-08-15', fournisseur: 'ChatGPT', montant: 136.01, devise: 'EUR', note: null },
  { date: '2026-08-16', fournisseur: 'OVHcloud', montant: 25.46, devise: 'EUR', note: null },
  { date: '2026-08-17', fournisseur: 'Vercel', montant: 0.43, devise: 'EUR', note: '0,50 USD — usage' },
  { date: '2026-08-17', fournisseur: 'Vercel', montant: 20.83, devise: 'EUR', note: '24,00 USD — transaction ANNULÉE/remboursée le jour même, non comptée dans le total', annulee: true },
];

function getTotaux() {
  const retenues = DEPENSES.filter(d => !d.annulee);
  const total = Math.round(retenues.reduce((s, d) => s + d.montant, 0) * 100) / 100;
  const parFournisseur = {};
  retenues.forEach(d => { parFournisseur[d.fournisseur] = Math.round(((parFournisseur[d.fournisseur] || 0) + d.montant) * 100) / 100; });
  return { retenues, total, parFournisseur };
}

module.exports = { DEPENSES, getTotaux };
