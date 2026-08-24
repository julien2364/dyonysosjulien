// Finance — coûts du portefeuille. Alimente l'onglet "Finance" de /espace-prive.
// Données de dépenses = transactions réelles trouvées dans les emails de notification Qonto
// (support@qonto.com, "Vous avez effectué un paiement") sur la boîte julien.daures@gmail.com,
// vérifiées le 23/08/2026. La carte Qonto "One" utilisée est récente (première transaction le
// 12-13/08/2026) : l'historique ci-dessous ne couvre donc qu'environ une semaine, pas un mois plein.
// Rien n'est extrapolé ni estimé au-delà de ce qui a été lu dans ces emails.
const { requireSession } = require('./_lib/session');
const { DEPENSES, getTotaux, ABONNEMENT_QONTO } = require('./_lib/finance-data');
const { PROJECTS } = require('./_lib/registry');

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
  const anthropic = retenues.filter(d => d.fournisseur === 'Anthropic (Claude)');
  if (anthropic.length >= 2) {
    const totalAnthropic = Math.round(anthropic.reduce((s, d) => s + d.montant, 0) * 100) / 100;
    conseils.push(`3 changements de plan Anthropic (Claude) en moins de 3 semaines (Pro→Max 5x le 01/08, Max 5x→Max 20x le 06/08, puis usage prépayé le 19/08) totalisant ${totalAnthropic.toFixed(2)} € — chaque changement facture le reliquat non utilisé du plan précédent en négatif : vérifier si le bon palier est enfin trouvé ou si ça va encore bouger.`);
  }

  // --- Objectifs du mois — calculé depuis le registre réel (priorite/etat/taches), pas un chiffre
  // inventé. "Livré ce mois" = faits réels de cette session (commits/vérifications directes), horodatés.
  const projetsUrgents = PROJECTS.filter(p => p.priorite && p.priorite.startsWith('urgent'));
  const tachesEnCours = projetsUrgents.flatMap(p => (p.taches || []).map(t => ({ projet: p.name, tache: t })));
  const objectifsMois = {
    configured: true,
    mois: '2026-08',
    note: 'Pas un objectif euro fixé arbitrairement (aucun n\'a été donné par toi) — un rollup réel de ce que le registre de projets dit être urgent/en cours/livré ce mois. Recalculé automatiquement à chaque appel depuis api/_lib/registry.js.',
    projetsUrgents: projetsUrgents.map(p => p.name),
    tachesEnCoursUrgentes: tachesEnCours,
    livreCeMois: [
      { date: '2026-08-16', item: 'IONOS : renouvellement Pack Domaine + Email Basic 5 identifié et chiffré (16,34€)' },
      { date: '2026-08-23', item: 'Odoo interrogé en direct : 7 comptes Social Marketing réels trouvés (Dyonysos), aucun pour Pet Stone/YouTube/TikTok' },
      { date: '2026-08-24', item: 'Pet Stone — Social Publisher réactivé sur Make après vérification RPC des IDs Facebook/LinkedIn' },
      { date: '2026-08-24', item: 'Diagnostic du scénario Make cassé "CVDesignPro — Publish social calendar" (erreur Google Drive identifiée, non corrigée en direct pour éviter un post LinkedIn non revu)' },
      { date: '2026-08-24', item: 'Dépenses Anthropic/OVHcloud/IONOS réelles ajoutées à Finance (6 lignes, montants lus sur reçus/factures)' },
      { date: '2026-08-24', item: 'Doublon "Annuaire entreprises C2B/B2B" fusionné dans le registre (Propecto = Firmoscope/Prospeo renommé)' },
      { date: '2026-08-24', item: 'Backlog granulaire réel importé (525 lignes, Pilotage-des-projets.xlsx) pour 8 projets jusque-là sans détail de tâches' },
      { date: '2026-08-24', item: 'CRM : constat Odoo non exploitable clarifié + Taiga identifié comme outil demandé (non connecté)' },
      { date: '2026-08-24', item: 'Stratégie : concurrents réels + BMC/SWOT sourcés pour CVDesignPro, Pet Stone, Content Engine DYONYSOS ; correction factuelle Pet Stone (pas de la lithothérapie, produit "pet rock")' },
    ],
    aFaireEnPriorite: tachesEnCours.slice(0, 8),
  };

  // --- Prévisionnel — plancher de coûts CONNUS (abonnements/outils déjà vus dans les dépenses réelles
  // ci-dessus), projeté 6 et 12 mois. Explicitement un plancher de coûts, jamais un revenu extrapolé.
  const qontoMensuel = Math.round((ABONNEMENT_QONTO.montantAnnuel / 12) * 100) / 100;
  const mensuelConnu = {
    'Keepa': 49.00,
    'Anthropic (Claude)': null, // 3 changements de plan en 3 semaines — pas de palier stable identifié, voir conseils
  };
  const planchers6et12 = Object.entries(parFournisseur)
    .filter(([f]) => f !== 'Anthropic (Claude)')
    .map(([f, montantConnu]) => {
      const mensuel = mensuelConnu[f] != null ? mensuelConnu[f] : null;
      return { fournisseur: f, montantConnuSurLaPeriode: montantConnu, hypotheseMensuelle: mensuel };
    });
  const planchesConnusMensuels = Object.entries(mensuelConnu).filter(([, v]) => v != null).reduce((s, [, v]) => s + v, 0) + qontoMensuel;
  const previsionnel = {
    configured: true,
    note: 'Toujours pas de revenu prévisionnel (aucune donnée de CA fiable) — mais un plancher de coûts connus projeté, pour au moins savoir ce que le portefeuille coûte à minima. Keepa (49€/mois) et l\'abonnement Qonto lui-même (228€/an, trouvé le 24/08 dans l\'email de bienvenue du 18/12/2025) sont les 2 lignes avec une vraie cadence confirmée ; les autres fournisseurs (OVHcloud, IONOS, ChatGPT, Vercel, Anthropic) n\'ont pas de cadence assez régulière dans l\'historique actuel pour projeter un montant mensuel honnête — listés avec leur montant réel connu sur la période observée seulement.',
    detailParFournisseur: planchesConnusMensuels ? planchesConnusMensuels : null,
    planchers: planchesConnusMensuels ? {
      mensuelMinimumConnu: Math.round(planchesConnusMensuels * 100) / 100,
      sixMois: Math.round(planchesConnusMensuels * 6 * 100) / 100,
      douzeMois: Math.round(planchesConnusMensuels * 12 * 100) / 100,
      composition: `Keepa (49€/mois) + Qonto forfait Smart (228€/an = ${qontoMensuel.toFixed(2)}€/mois) — les 2 seuls abonnements à cadence confirmée dans l'historique actuel.`,
    } : null,
    autresCoutsConnusNonProjetes: planchers6et12,
    prochainePasse: 'Les emails "Votre relevé de [mois] est disponible" (Qonto, mars à juillet 2026 trouvés) ne contiennent PAS le relevé en pièce jointe — juste un lien de téléchargement vers le portail Qonto, qui demande une connexion. Cette session ne peut pas se connecter à ton compte bancaire (identifiants/mots de passe jamais saisis par un agent). Pour aller plus loin sur ce point : télécharge toi-même ces PDF depuis Qonto et dépose-les ici, ou donne un accès API Qonto en lecture seule.',
  };

  return res.status(200).json({
    updatedAt: '2026-08-24',
    source: 'Qonto (carte "One", active depuis le 12/08/2026) + reçus Anthropic (Claude) + factures OVHcloud/IONOS — tout trouvé par recherche directe dans les emails, montants réels lus sur chaque reçu/facture.',
    avertissement: 'Historique réel mais partiel : Qonto ne couvre qu\'~1 semaine (carte récente) ; Anthropic/OVHcloud/IONOS couvrent début juillet à mi-août 2026 mais seules les factures effectivement ouvertes sont chiffrées ici — d\'autres existent (renouvellements de domaines réguliers) sans montant vérifié. Ne pas extrapoler sur un mois complet ni traiter ce total comme exhaustif. Des relevés Qonto mensuels (avril à juillet 2026) existent en pièce jointe email mais n’ont pas encore été ouverts/dépouillés.',
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
      { sujet: 'Relevés Qonto mensuels', detail: 'Correction du 24/08 : les emails "Votre relevé de [mois] est disponible" (Mars à Juillet 2026 trouvés, + Décembre 2025) ne contiennent PAS le PDF en pièce jointe — juste un lien vers le portail Qonto qui demande une connexion. Cette session ne se connecte jamais à un compte bancaire (identifiants jamais saisis). À dépouiller si toi-même les télécharges et les déposes ici.' },
      { sujet: 'Facture fournisseur Odoo (Dyonysos)', detail: 'Notification "Nouvelle facture dans le journal Factures fournisseurs" reçue le 16/08 (notifications@dyonysos.be) — brouillon, montant non consulté.' },
      { sujet: 'Historique OVHcloud/IONOS antérieur à juillet 2026', detail: 'De nombreux avis de renouvellement/factures OVH et IONOS existent depuis fin 2025 (visibles dans la boîte mail) — seules les factures de juillet-août 2026 ont été ouvertes et chiffrées ci-dessus.' },
    ],
    // --- Ajouts du 23/08 (demande "Finance GO") — scaffolding honnête : structure prête, aucune
    // donnée fabriquée. Chaque bloc dit explicitement ce qui manque pour devenir réel.
    tcd: {
      note: 'Ventilation par projet impossible aujourd\'hui : aucune dépense ci-dessus n\'est taguée à un projet précis. La colonne "Mutualisé" reprend le vrai total par fournisseur ; les colonnes par projet resteront à 0 tant qu\'un tag projet n\'est pas ajouté à chaque dépense.',
      mutualise: parFournisseur,
      parProjet: {},
    },
    // Recalculés le 24/08/2026 sur demande explicite de Julien : "calcule tout ça avec le planning, ce
    // qui est en cours, réalisé" — plus un objectif euro inventé, mais un vrai rollup depuis le registre
    // de projets (api/_lib/registry.js) : ce qui est urgent, en cours, et ce qui a été livré ce mois.
    objectifsMois,
    // Prévisionnel recalculé le 24/08 : toujours pas d'extrapolation de revenu (aucune donnée fiable),
    // mais un plancher de coûts connus (abonnements/outils déjà identifiés dans les dépenses ci-dessus)
    // projeté sur 6 et 12 mois — explicitement un plancher, pas un budget complet.
    previsionnel,
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
      note: 'Cherché dans ton Drive le 24/08/2026 (demande "tu as des ébauches dans gdrive") : trouvé "Etat du budget mensualisé.xls" (créé le 19/08/2026, dossier Drive). Ouvert — c\'est un modèle vierge (« Bilan financier mensualisé », onglet ressources/revenus de remplacement/allocations…) : toutes les lignes sont à 0, rien n\'a été rempli. Ce n\'est donc pas une source de vraies données pour l\'instant, juste une structure prête à être remplie. Dossiers Drive encore non ouverts qui pourraient contenir du réel : "mis_builder_budget", "Smart Finance Guide", "01 - Personnel", "7 - Smart finance hub" — à vérifier si tu veux continuer cette piste.',
    },
    etatActuel: {
      configured: false,
      note: 'Banque, cash disponible et assets ne sont pas connectés en direct (pas d\'API bancaire branchée) — les seuls chiffres réels de ce module viennent des emails de notification Qonto ci-dessus. Le modèle "Etat du budget mensualisé.xls" trouvé dans le Drive (voir financesPersonnelles) est vierge — pas encore de vraie donnée personnelle séparée du pro.',
    },
    conseils,
  });
};
