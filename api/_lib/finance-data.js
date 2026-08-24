// Dépenses réelles du portefeuille — extrait de api/finance.js pour être partagé sans duplication
// avec d'autres modules (KPI, Stratégie) qui ont besoin des mêmes coûts réels.
// Source principale : transactions réelles trouvées dans les emails de notification Qonto
// (support@qonto.com, "Vous avez effectué un paiement") sur la boîte julien.daures@gmail.com,
// vérifiées le 23/08/2026. La carte Qonto "One" utilisée est récente (première transaction le
// 12-13/08/2026) : l'historique Qonto ne couvre donc qu'environ une semaine, pas un mois plein.
// Complété le 24/08/2026 : reçus Anthropic (Claude) et factures OVHcloud/IONOS trouvés directement
// par recherche Gmail (montants réels lus dans chaque email/reçu, pas de carte Qonto pour ceux-là —
// paiement direct par carte bancaire hors Qonto). Rien n'est extrapolé ni estimé.
const DEPENSES = [
  { date: '2026-08-01', fournisseur: 'Anthropic (Claude)', montant: 96.23, devise: 'EUR', note: 'Reçu #2649-9224-6519 — passage au plan Max 5x (déduction du reliquat Claude Pro non utilisé)' },
  { date: '2026-08-03', fournisseur: 'OVHcloud', montant: 7.99, devise: 'EUR', note: 'Facture FR79732010' },
  { date: '2026-08-06', fournisseur: 'Anthropic (Claude)', montant: 125.17, devise: 'EUR', note: 'Reçu #2153-9495-3813 — passage au plan Max 20x (déduction du reliquat Max 5x non utilisé)' },
  { date: '2026-08-12', fournisseur: 'ChatGPT', montant: 99.53, devise: 'EUR', note: null },
  { date: '2026-07-26', fournisseur: 'IONOS', montant: 13.31, devise: 'EUR', note: 'Facture 202545839795 — Pack Domaine (contrat 98653787)' },
  { date: '2026-07-26', fournisseur: 'IONOS', montant: 3.03, devise: 'EUR', note: 'Facture 202545839795 — Email Basic 5 (contrat 106176152)' },
  { date: '2026-08-15', fournisseur: 'Keepa', montant: 49.00, devise: 'EUR', note: 'Outil de suivi de prix Amazon' },
  { date: '2026-08-15', fournisseur: 'ChatGPT', montant: 136.01, devise: 'EUR', note: null },
  { date: '2026-08-16', fournisseur: 'OVHcloud', montant: 25.46, devise: 'EUR', note: 'Facture FR79830343' },
  { date: '2026-08-17', fournisseur: 'Vercel', montant: 0.43, devise: 'EUR', note: '0,50 USD — usage' },
  { date: '2026-08-17', fournisseur: 'Vercel', montant: 20.83, devise: 'EUR', note: '24,00 USD — transaction ANNULÉE/remboursée le jour même, non comptée dans le total', annulee: true },
  { date: '2026-08-19', fournisseur: 'Anthropic (Claude)', montant: 92.57, devise: 'EUR', note: 'Reçu #2032-8557-7896 — usage prépayé supplémentaire, plan Individual' },
];

// Note honnête : d'autres factures OVHcloud/IONOS existent avant juillet 2026 (renouvellements de
// domaines réguliers, visibles dans la boîte mail) mais n'ont pas toutes été ouvertes une par une —
// seules celles ci-dessus ont un montant réel vérifié. Le total ci-dessous est donc un plancher, pas
// un total exhaustif de tout l'historique OVH/IONOS.

// Abonnement Qonto lui-même (pas une dépense DEPENSES[] car ce n'est pas une notification de paiement
// carte — trouvé le 24/08/2026 dans l'email de bienvenue du 18/12/2025) : forfait "Smart" à 228,00 EUR
// facturé annuellement. Confirmé réel (texte de l'email), utilisé dans le prévisionnel.
const ABONNEMENT_QONTO = { nom: 'Qonto — forfait Smart', montantAnnuel: 228.00, devise: 'EUR', depuis: '2025-12-18', source: 'Email Qonto "Ce que vous devez savoir sur votre dépôt de capital" du 18/12/2025' };

function getTotaux() {
  const retenues = DEPENSES.filter(d => !d.annulee);
  const total = Math.round(retenues.reduce((s, d) => s + d.montant, 0) * 100) / 100;
  const parFournisseur = {};
  retenues.forEach(d => { parFournisseur[d.fournisseur] = Math.round(((parFournisseur[d.fournisseur] || 0) + d.montant) * 100) / 100; });
  return { retenues, total, parFournisseur };
}

module.exports = { DEPENSES, getTotaux, ABONNEMENT_QONTO };
