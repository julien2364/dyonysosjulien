// Stratégie — vue portefeuille, alimente l'onglet "Stratégie" de /espace-prive.
// Priorité demandée par Julien le 23/08/2026. Tout est calculé en direct depuis le registre réel
// (api/_lib/registry.js) et le snapshot de trafic réel (api/_lib/kpi-data.js) — rien n'est extrapolé.
// La partie "Veille & tendances" est un scaffolding honnête : aucune source de données de tendance
// (Google Trends, SerpApi, Similarweb…) n'est branchée aujourd'hui. Les mots-clés affichés sont des
// pistes de veille manuelle par projet, pas des mesures réelles — voir "commentBrancherVeille".
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');
const { TRAFIC_SNAPSHOT } = require('./_lib/kpi-data');

// Pistes de veille manuelle, écrites à la main à partir de la catégorie et de l'activité réelle de
// chaque projet piloté activement (ceux qui ont un champ "priorite" dans le registre). Pas une
// extraction automatique — à traiter comme un point de départ à valider, pas un fait mesuré.
const VEILLE_PAR_PROJET = {
  'CVDesignPro': { motsCles: ['générateur de CV en ligne', 'CV ATS friendly', 'modèle de CV gratuit'], domainesConnexes: ['recrutement / RH', 'coaching carrière', 'lettre de motivation IA'] },
  'Pet Stone': { motsCles: ['boutique en ligne animaux', 'pierre de lithothérapie', 'accessoires chat/chien'], domainesConnexes: ['lithothérapie / bien-être', 'e-commerce niche animaux'] },
  'École Connect': { motsCles: ['plateforme école en ligne', 'gestion établissement scolaire'], domainesConnexes: ['EdTech', 'communication parents-école'] },
  'Firmoscope / Prospeo': { motsCles: ['annuaire entreprises gratuit', 'recherche SIREN/SIRET', 'données légales entreprise'], domainesConnexes: ['scoring / data B2B', 'prospection commerciale'] },
  'Arbitrage+': { motsCles: ['arbitrage Amazon', 'sourcing produits revente', 'FBA outils'], domainesConnexes: ['e-commerce Amazon FBA', 'dropshipping'] },
  'Analyzer+': { motsCles: ['analyse produit Amazon', 'estimation ventes Amazon'], domainesConnexes: ['e-commerce Amazon FBA', 'outils vendeurs Amazon'] },
  'Profit+': { motsCles: ['calcul rentabilité Amazon', 'suivi marge vendeur Amazon'], domainesConnexes: ['e-commerce Amazon FBA', 'comptabilité vendeur en ligne'] },
  'Content Engine DYONYSOS': { motsCles: ['planification réseaux sociaux', 'automatisation publication multi-canal'], domainesConnexes: ['MarTech', 'outils créateurs de contenu'] },
};

module.exports = function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!requireSession(req, res)) return;
  res.setHeader('Cache-Control', 'private, no-store');

  // --- Niveau 1 : portefeuille ---
  const traficParNom = {};
  TRAFIC_SNAPSHOT.parProjet.forEach(p => { traficParNom[p.name] = p.periodes['30j'] || null; });

  const urgents = PROJECTS.filter(p => p.priorite && p.priorite.startsWith('urgent'));
  const meilleurTrafic = TRAFIC_SNAPSHOT.parProjet.reduce((best, p) => {
    const v = p.periodes['30j'] ? p.periodes['30j'].visiteurs : -1;
    return (!best || v > best.v) ? { name: p.name, v } : best;
  }, null);
  const projetsAZeroVisiteur = TRAFIC_SNAPSHOT.parProjet.filter(p => p.periodes['30j'] && p.periodes['30j'].visiteurs === 0).map(p => p.name);

  // --- Niveau 2 : projets prioritaires (ceux qui ont un statut de priorité réel dans le registre) ---
  const rangPriorite = { 'urgent': 0, 'normal': 1, 'à auditer': 2 };
  const projetsPrioritaires = PROJECTS
    .filter(p => p.priorite)
    .sort((a, b) => (rangPriorite[a.priorite.split(' ')[0]] ?? 9) - (rangPriorite[b.priorite.split(' ')[0]] ?? 9))
    .map(p => ({
      name: p.name,
      priorite: p.priorite,
      trafic30j: traficParNom[p.name] ? traficParNom[p.name].visiteurs : null,
      pisteOptimisation: (p.taches && p.taches[0]) || null,
    }));

  // --- Concurrents / benchmarks — réel, déjà vérifié pour Automation Remake ; à faire pour les autres ---
  const benchmarks = [
    { projet: 'CVDesignPro', concurrentsIdentifies: 'Canva CV, Zety, Novoresume — à confirmer', etat: 'à faire' },
    { projet: 'Firmoscope / Prospeo', concurrentsIdentifies: 'Societe.com, Pappers, Infogreffe — à confirmer', etat: 'à faire' },
    { projet: 'Automation Remake', concurrentsIdentifies: 'Make, Zapier, n8n — déjà écartés pour raisons de licence (cœur MIT Activepieces retenu)', etat: 'fait' },
  ];

  // --- Veille & tendances (nouveau, demandé le 23/08) ---
  const veille = projetsPrioritaires
    .map(p => p.name)
    .filter(name => VEILLE_PAR_PROJET[name])
    .map(name => ({ projet: name, ...VEILLE_PAR_PROJET[name] }));

  // Domaines connexes au niveau portefeuille : regroupement qualitatif réel à partir de la taxonomie
  // "categorie" déjà présente dans le registre (pas une source de tendance, juste un rapprochement
  // d'audience/marché entre familles de projets qui existent réellement dans le portefeuille).
  const parCategorie = {};
  PROJECTS.forEach(p => { (parCategorie[p.categorie] = parCategorie[p.categorie] || []).push(p.name); });
  const domainesConnexesPortefeuille = [
    { cluster: 'Commerce Amazon (Arbitrage+, Analyzer+, Profit+)', connexeA: 'Annuaire entreprises C2B/B2B (Firmoscope/Prospeo)', raison: 'audience professionnelle e-commerce/vente en ligne partagée' },
    { cluster: 'Éducation / formation / recrutement (CVDesignPro, École Connect, CoursHub)', connexeA: 'Digitalisation / marque blanche', raison: 'cible B2B/RH commune sur certaines offres' },
    { cluster: 'Marketplaces personnels (Pet Stone, Amazon, Vinted)', connexeA: 'Création et médias', raison: 'besoin commun de visuels produit et de contenu social' },
  ];

  return res.status(200).json({
    capturedAt: '2026-08-23',
    portefeuille: {
      projetsActifs: PROJECTS.filter(p => p.url).length,
      urgents: urgents.map(p => p.name),
      meilleurTrafic30j: meilleurTrafic,
      projetsAZeroVisiteur,
    },
    projetsPrioritaires,
    benchmarks,
    veille: {
      constat: 'Aucune source de données de tendance réelle (Google Trends, SerpApi Trends, Similarweb…) n\'est branchée aujourd\'hui. Les mots-clés et domaines connexes ci-dessous sont des pistes de veille manuelle par projet, écrites à partir de leur activité réelle — pas des mesures live.',
      parProjet: veille,
      domainesConnexesPortefeuille,
      commentBrancherVeille: 'Pour avoir de vrais chiffres de tendance ici : soit un abonnement SerpApi (Google Trends via API, payant) soit la librairie non-officielle pytrends (gratuite mais fragile, Google peut la bloquer) branchés côté serveur avec un cache — à décider ensemble avant d\'implémenter, aucune clé n\'a été demandée ou stockée pour l\'instant.',
    },
    parCategorie,
  });
};
