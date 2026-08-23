// Finance — coûts du portefeuille. Alimente l'onglet "Finance" de /espace-prive.
// Données de dépenses = transactions réelles trouvées dans les emails de notification Qonto
// (support@qonto.com, "Vous avez effectué un paiement") sur la boîte julien.daures@gmail.com,
// vérifiées le 23/08/2026. La carte Qonto "One" utilisée est récente (première transaction le
// 12-13/08/2026) : l'historique ci-dessous ne couvre donc qu'environ une semaine, pas un mois plein.
// Rien n'est extrapolé ni estimé au-delà de ce qui a été lu dans ces emails.
const { requireSession } = require('./_lib/session');

const DEPENSES = [
  { date: '2026-08-12', fournisseur: 'ChatGPT', montant: 99.53, devise: 'EUR', note: null },
  { date: '2026-08-15', fournisseur: 'Keepa', montant: 49.00, devise: 'EUR', note: 'Outil de suivi de prix Amazon' },
  { date: '2026-08-15', fournisseur: 'ChatGPT', montant: 136.01, devise: 'EUR', note: null },
  { date: '2026-08-16', fournisseur: 'OVHcloud', montant: 25.46, devise: 'EUR', note: null },
  { date: '2026-08-17', fournisseur: 'Vercel', montant: 0.43, devise: 'EUR', note: '0,50 USD — usage' },
  { date: '2026-08-17', fournisseur: 'Vercel', montant: 20.83, devise: 'EUR', note: '24,00 USD — transaction ANNULÉE/remboursée le jour même, non comptée dans le total', annulee: true },
];

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const retenues = DEPENSES.filter(d => !d.annulee);
  const total = Math.round(retenues.reduce((s, d) => s + d.montant, 0) * 100) / 100;
  const parFournisseur = {};
  retenues.forEach(d => { parFournisseur[d.fournisseur] = Math.round(((parFournisseur[d.fournisseur] || 0) + d.montant) * 100) / 100; });

  return res.status(200).json({
    updatedAt: '2026-08-23',
    source: 'Emails de notification de paiement Qonto (support@qonto.com), carte "One" active depuis le 12/08/2026',
    avertissement: 'Historique partiel (~1 semaine, carte récente) — ne pas extrapoler sur un mois complet. Des relevés Qonto mensuels (avril à juillet 2026) existent en pièce jointe email mais n’ont pas encore été ouverts/dépouillés.',
    depenses: DEPENSES,
    totalRetenu: total,
    parFournisseur,
    stripe: {
      configured: false,
      note: 'Compte Stripe créé et configuré entre le 12 et le 18/08/2026 (emails Stripe : configuration du compte, premier produit récurrent créé le 17/08, paiements activés). Rattachement précis à un ou plusieurs projets non confirmé — un événement calendrier du 15/08 ("modification stripe pet stone") suggère Pet Stone, mais CVDesignPro a aussi un plan payant prévu (12,99€/mois). Pas de clé API fournie : identifié par recherche email uniquement, aucun montant de revenu récupéré.',
    },
    aRelier: [
      { sujet: 'Frais & TVA Amazon (Dyonysos BE)', detail: 'Analyse déjà réalisée par toi, rapport Q2 2026 envoyé par email les 20-21/08/2026 (11 lignes AMAZON_FEE) — pas encore intégrée ici en euros consolidés.' },
      { sujet: 'Vinted', detail: 'Aucune donnée financière trouvée pour l’instant — à connecter.' },
      { sujet: 'Relevés Qonto mensuels', detail: 'Avril, Mai, Juin, Juillet 2026 disponibles en pièce jointe (emails "Votre relevé de [mois] est disponible") — non dépouillés ici.' },
      { sujet: 'Anthropic', detail: 'Un reçu Anthropic (#2032-8557-7896) reçu le 20/08/2026 — montant non extrait de l’aperçu, à ouvrir pour le chiffrer précisément.' },
      { sujet: 'Facture fournisseur Odoo (Dyonysos)', detail: 'Notification "Nouvelle facture dans le journal Factures fournisseurs" reçue le 16/08 (notifications@dyonysos.be) — brouillon, montant non consulté.' },
    ],
  });
};
