// Stratégie — vue portefeuille, alimente l'onglet "Stratégie" de /espace-prive.
// Priorité demandée par Julien le 23/08/2026. Tout est calculé en direct depuis le registre réel
// (api/_lib/registry.js) et le snapshot de trafic réel (api/_lib/kpi-data.js) — rien n'est extrapolé.
// La partie "Veille & tendances" est un scaffolding honnête : aucune source de données de tendance
// (Google Trends, SerpApi, Similarweb…) n'est branchée aujourd'hui. Les mots-clés affichés sont des
// pistes de veille manuelle par projet, pas des mesures réelles — voir "commentBrancherVeille".
const { requireSession } = require('./_lib/session');
const { PROJECTS } = require('./_lib/registry');
const { TRAFIC_SNAPSHOT } = require('./_lib/kpi-data');
const { COMPETITORS_REAL, CONCURRENTS_PORTEFEUILLE, BMC_SWOT } = require('./_lib/strategie-data');

// Pistes de veille manuelle, écrites à la main à partir de la catégorie et de l'activité réelle de
// chaque projet piloté activement (ceux qui ont un champ "priorite" dans le registre). Pas une
// extraction automatique — à traiter comme un point de départ à valider, pas un fait mesuré.
const VEILLE_PAR_PROJET = {
  'CVDesignPro': { motsCles: ['générateur de CV en ligne', 'CV ATS friendly', 'modèle de CV gratuit'], domainesConnexes: ['recrutement / RH', 'coaching carrière', 'lettre de motivation IA'] },
  'Pet Stone': { motsCles: ['pet rock / cadeau humoristique animal', 'boîte-cadeau insolite', 'fausse adoption animal de compagnie'], domainesConnexes: ['cadeau insolite / gift box', 'e-commerce niche humour'] },
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

  // --- Concurrents / benchmarks — recherche web réelle du 24/08/2026 (voir _lib/strategie-data.js pour
  // le détail complet + sources par concurrent) ; remplace les précédents "à confirmer".
  const benchmarks = [
    { projet: 'CVDesignPro', concurrentsIdentifies: 'CVDesignR, Zety, Resume.io, Novoresume, Kickresume, Rezi, Canva CV', etat: 'fait' },
    { projet: 'Firmoscope / Prospeo (ex-Propecto)', concurrentsIdentifies: 'Societe.com, Pappers, Kompass, Manageo, Ellisphere, Altares, Sirene (gratuit)', etat: 'fait' },
    { projet: 'Pet Stone', concurrentsIdentifies: 'Vendeurs "Pet Rock" (Etsy) ; marché adjacent JoyDogCat (colliers lithothérapie chien/chat, produit différent)', etat: 'fait' },
    { projet: 'Automation Remake', concurrentsIdentifies: 'Make, Zapier, n8n — déjà écartés pour raisons de licence (cœur MIT Activepieces retenu)', etat: 'fait' },
    ...CONCURRENTS_PORTEFEUILLE,
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
    // Ajouté le 24/08/2026 : Business Model Canvas + SWOT réels (recherche web sourcée) pour les 3
    // projets urgents. Le reste du portefeuille n'a que la ligne "concurrents" (benchmarks) ci-dessus —
    // un BMC/SWOT complet par projet supplémentaire demande une passe dédiée par projet, pas fait ce soir.
    marcheParProjet: COMPETITORS_REAL,
    bmcSwot: {
      note: 'BMC (Business Model Canvas) + SWOT construits les 24/08/2026 (3 projets urgents) puis complétés le soir même sur demande explicite ("de suite") pour le reste du portefeuille, via 8 agents de recherche web sourcée au total. Toute case sans donnée interne fiable dit "à valider avec Julien" plutôt que d\'inventer. 14 des 15 projets du registre sont couverts (Mym++/Tinder++ = 2 BMC sous une même fiche, statut "gelé commercialisation"). Reste non couvert : Firmoscope/Prospeo n\'a que le concurrentiel (marcheParProjet), pas de BMC/SWOT dédié — à faire si utile.',
      projets: BMC_SWOT,
    },
  });
};
