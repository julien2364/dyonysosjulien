// Finance — coûts du portefeuille. Alimente l'onglet "Finance" de /espace-prive.
// Données de dépenses = transactions réelles trouvées dans les emails de notification Qonto
// (support@qonto.com, "Vous avez effectué un paiement") sur la boîte julien.daures@gmail.com,
// vérifiées le 23/08/2026. La carte Qonto "One" utilisée est récente (première transaction le
// 12-13/08/2026) : l'historique ci-dessous ne couvre donc qu'environ une semaine, pas un mois plein.
// Rien n'est extrapolé ni estimé au-delà de ce qui a été lu dans ces emails.
const { requireSession } = require('./_lib/session');
const { DEPENSES, getTotaux } = require('./_lib/finance-data');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const { retenues, total, parFournisseur } = getTotaux();

  // Conseils calculés à partir des vraies dépenses ci-dessus — des observations, pas des faits établis.
  const conseils = [];
  const chatgpt = retenues.filter(d => d.fournisseur === 'ChatGPT');
  if (chatgpt.length >= 2) {
    const totalChatgpt = Math.round(chatgpt.reduce((s, d) => s + d.montant, 0) * 100) / 100;
    conseils.push(`2 paiements ChatGPT en 3 jours (12/08 et 15/08) totalisant ${totalChatgpt.toFixed(2)} € — à vérifier : abonnement + usage API séparés, ou double facturation.`);
  }
  conseils.push('Keepa (49 €/mois) et OVHcloud (25,46 €) n\'ont pas encore de projet explicitement rattaché dans ce tableau — les taguer permettrait de savoir si leur coût est justifié par le trafic/usage réel du projet concerné.');

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
    // --- Ajouts du 23/08 (demande "Finance GO") — scaffolding honnête : structure prête, aucune
    // donnée fabriquée. Chaque bloc dit explicitement ce qui manque pour devenir réel.
    tcd: {
      note: 'Ventilation par projet impossible aujourd\'hui : aucune dépense ci-dessus n\'est taguée à un projet précis. La colonne "Mutualisé" reprend le vrai total par fournisseur ; les colonnes par projet resteront à 0 tant qu\'un tag projet n\'est pas ajouté à chaque dépense.',
      mutualise: parFournisseur,
      parProjet: {},
    },
    objectifsMois: {
      configured: false,
      mois: '2026-08',
      note: 'Aucun objectif chiffré n\'a été fixé pour l\'instant. Ce bloc affichera achats/frais fixes/déductibles visés dès qu\'un objectif est défini avec toi.',
    },
    previsionnel: {
      configured: false,
      note: 'Un prévisionnel 6 mois / 1 an ne peut pas être construit honnêtement sur ~1 semaine d\'historique Qonto — ce serait de l\'extrapolation, pas une prévision. Dépouiller les relevés Qonto avril-juillet 2026 (déjà reçus par email, pas encore ouverts) donnerait assez de recul pour un premier prévisionnel réaliste.',
    },
    autresDepenses: {
      configured: false,
      categories: ['Véhicule', 'Téléphone'],
      note: 'Pas de source connectée. Un module Fleet existe dans l\'Odoo encore actif (pet-stone.shop) et pourrait donner les coûts véhicule réels si vérifié avant l\'abandon d\'Odoo — non fait ce soir, Odoo étant en cours de sortie de service.',
    },
    dougs: {
      configured: false,
      note: 'Dougs retenu par toi comme comptabilité de référence (notamment pour la conformité), à la place de la compta Odoo. Aucun détail d\'intégration/API connu pour l\'instant — à clarifier avec toi avant tout branchement.',
    },
    financesPersonnelles: {
      configured: false,
      note: 'Section prévue (assets personnels, état banque perso séparé du pro) — aucune source connectée aujourd\'hui.',
    },
    etatActuel: {
      configured: false,
      note: 'Banque, cash disponible et assets ne sont pas connectés en direct (pas d\'API bancaire branchée) — les seuls chiffres réels de ce module viennent des emails de notification Qonto ci-dessus.',
    },
    conseils,
  });
};
