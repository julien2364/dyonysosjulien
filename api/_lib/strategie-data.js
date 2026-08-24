// Analyse concurrentielle + BMC/SWOT réels — recherchés sur le web le 24/08/2026 (agents dédiés, sources
// citées ci-dessous pour chaque affirmation externe). "à valider avec Julien" = information réelle
// manquante côté interne (traction, coûts, contrats) que la recherche web ne peut pas fournir — jamais
// une donnée inventée pour combler le vide.

const COMPETITORS_REAL = {
  'CVDesignPro': {
    marche: 'Resume Builder (mondial) : 8,86 Md$ (2025) → 12,55 Md$ (2030), CAGR 7,2%. AI Recruitment (mondial) : 601,5 M$ (2025) → 1,16 Md$ (2034), CAGR 7,5%. Taille du marché francophone spécifique : non trouvé.',
    sourcesMarche: ['https://www.researchandmarkets.com/reports/6089781/resume-builder-market-report', 'https://straitsresearch.com/report/ai-recruitment-market'],
    concurrents: [
      { nom: 'CVDesignR', note: 'Leader francophone auto-déclaré (5M candidats), gratuit + IA, ATS scanner', prix: 'non trouvé', source: 'https://cvdesignr.com/fr' },
      { nom: 'Zety', note: 'Généraliste international, IA', prix: '~71 à 337 $/an selon offre', source: 'https://zety.com/pricing' },
      { nom: 'Resume.io', note: 'Généraliste international', prix: '~50 $/3 mois', source: 'https://pitchmeai.com/blog/resume-io-pricing-cost' },
      { nom: 'Novoresume', note: 'Design premium + coaching carrière', prix: '~24 $/mois', source: 'https://stylingcv.com/blog/novoresume-review-2026-features-pricing-pros-cons-worth-it/' },
      { nom: 'Kickresume', note: 'IA + vérificateur ATS + Career Map', prix: '8 à 24 $/mois', source: 'https://www.kickresume.com/en/pricing/' },
      { nom: 'Rezi', note: '« #1 AI Resume Builder », ATS-first', prix: '29 $/mois, lifetime 149 $', source: 'https://www.rezi.ai/pricing' },
      { nom: 'Canva CV', note: 'Modèles CV gratuits inclus dans Canva généraliste, pas un produit CV dédié', prix: 'gratuit / inclus Canva Pro', source: 'https://www.canva.com/fr_fr/creer/cv/moderne/' },
    ],
    positionnement: 'CVDesignPro (12,99€/mois + 39€/an) est nettement moins cher que tous les concurrents US/UK trouvés (~70 à 330 $/an) — avantage prix euro/francophone potentiel. Différenciateur repéré : formats institutionnels (Europass, DIGIT-TM, OTAN), non vérifié chez les concurrents.',
  },
  'Pet Stone': {
    correctifImportant: 'Recherche web du 24/08/2026 : pet-stone.shop ne vend PAS des pierres de lithothérapie pour animaux. C\'est un produit-cadeau humoristique type « pet rock » (pierre décorative en boîte, présentée comme une fausse adoption d\'animal, avec faux certificat/guide de dressage) — zéro mention de lithothérapie ou de propriétés énergétiques sur le site. Gamme : Original 29,90€, éditions saisonnières (Noël/Halloween/St-Valentin/Fête des Pères-Mères) 24,78 à 59€. Une page Facebook liée indique « Pet Stone (Brussels) » — à clarifier avec Julien si le marché cible est FR, BE, ou les deux. Ceci corrige toute mention antérieure de « lithothérapie » pour Pet Stone dans ce dashboard.',
    marche: 'Marché des animaux de compagnie en France : ~14 Md€ (2025, dont alimentation 6,3 Md€, soins vétérinaires ~5 Md€) — étude Xerfi. Marché européen des coffrets/objets-cadeaux : ~1 Md€, France = marché le plus mature d\'Europe mais croissance ralentie depuis 2016. Taille précise du marché « pet rock »/cadeau insolite : non trouvé.',
    sourcesMarche: ['https://savoir-animal.fr/les-animaux-de-compagnieun-marche-toujours-florissant-de-14-milliards-deuros/', 'https://www.businesscoot.com/en/study/the-gift-box-market-france'],
    concurrents: [
      { nom: 'Vendeurs "Pet Rock" sur Etsy', note: 'Nombreux vendeurs indépendants, prix bas', prix: 'dès ~4 €', source: 'https://www.etsy.com/fr/market/pet_rock' },
      { nom: 'JoyDogCat (Avignon, FR)', note: 'Marché adjacent réel : colliers en pierres semi-précieuses pour chiens/chats — produit différent (accessoire porté), pas un concurrent frontal', prix: 'dès 39€', source: 'https://www.joydogcat.com/' },
      { nom: 'Lithothérapie générale (France Minéraux, Trésor Minéral, Pierres d\'Émotions)', note: 'Bijoux/pierres énergétiques classiques, sans lien animal — marché voisin, pas le même produit', prix: 'variable', source: 'https://www.france-mineraux.fr/boutique-lithotherapie/' },
    ],
    positionnement: 'Aucun concurrent français direct identifié combinant « pet rock humoristique + éditions saisonnières » à l\'échelle de Pet Stone — angle produit peu disputé, mais catégorie de niche (petit marché).',
  },
  'Firmoscope / Prospeo (ex-Propecto)': {
    marche: 'Lead generation B2B (mondial) : 3,34 Md$ (2026) → 9,18 Md$ (2035), CAGR 11,9%. Baromètre du Lead France 2026 : volumes leads BtoB +4% (2024→2025) ; CPL Finance/Gestion BtoB 90€ (+69,8%). Taille du marché français spécifique de la vente de fichiers/annuaires B2B (hors lead gen) : non trouvé.',
    sourcesMarche: ['https://www.businessresearchinsights.com/market-reports/b2b-lead-generation-services-market-102402', 'https://www.effinity.fr/blog/barometre-lead-indicateurs-secteur/'],
    concurrents: [
      { nom: 'Societe.com', note: 'Annuaire grand public + pro, accès légal gratuit élargi depuis sept. 2024, monétise KBIS/rapports/exports', prix: 'rapport solvabilité ~13,90€ HT, KBIS certifié ~7,90€ HT', source: 'https://fichier.societe.com/pages/fichiers-entreprises.html' },
      { nom: 'Pappers', note: 'Data entreprises FR + API dev, freemium généreux (100 crédits gratuits)', prix: 'par crédits (fiche = 1 crédit)', source: 'https://www.pappers.fr/api' },
      { nom: 'Kompass', note: '« Leading producer of B2B data » France, 60+ pays, 10 000+ clients', prix: 'sur devis', source: 'https://fr.solutions.kompass.com/' },
      { nom: 'Manageo', note: 'Fichiers de prospection B2B qualifiés', prix: 'sur devis', source: 'https://www.espritdentreprise.com/9575/' },
      { nom: 'Ellisphere', note: 'Information entreprise & risk management', prix: 'sur devis', source: 'https://www.ellisphere.com/' },
      { nom: 'Altares (Dun & Bradstreet FR)', note: 'Numéro D-U-N-S, data internationale risk/compliance', prix: 'sur devis', source: 'https://www.altares.com/fr/nos-data/duns-number/' },
      { nom: 'Sirene / Annuaire des Entreprises (data.gouv.fr)', note: 'Référentiel officiel public — source primaire que revendent beaucoup de concurrents privés', prix: 'gratuit', source: 'https://annuaire-entreprises.data.gouv.fr/' },
    ],
    positionnement: 'Marché polarisé entre donnée légale officielle gratuite (Sirene), freemium API-first (Pappers), annuaire + services à la carte (Societe.com), et B2B/risk sur devis opaque (Kompass/Manageo/Ellisphere/Altares). Aucun concurrent trouvé avec grille B2B publique aussi simple que 29€/Team ×2,5/Corporate — différenciateur à valider avec Julien.',
  },
  // --- Ajouté le 24/08/2026 (soir), sur demande explicite de Julien ("de suite") — les ~11 autres
  // projets du portefeuille, via 4 agents de recherche web en parallèle. Même discipline anti-fabrication.
  'Arbitrage+': {
    marche: 'Pas de rapport dédié au segment "outils vendeurs Amazon FBA" trouvé. Repères adjacents : logiciels e-commerce (marché large) 7,03 Md$ (2024) → 25,32 Md$ (2033), CAGR 15,3% ; 2,5M+ vendeurs actifs sur Amazon dans le monde en 2026, 60%+ des ventes Amazon via tiers/FBA, revenu FBA moyen 160 000$/an (médian 35 000$/an).',
    sourcesMarche: ['https://www.skyquestt.com/report/e-commerce-software-market', 'https://thunderbit.com/blog/amazon-fba-stats'],
    concurrents: [
      { nom: 'Keepa', note: 'Quasi-standard data Amazon ; API Starter confirmée = même palier que celui souscrit par Arbitrage+', prix: 'Free ; Pro 29€/mois ; API Starter 49€/mois → Enterprise 11 099€/mois', source: 'https://revenuegeeks.com/software/keepa/pricing' },
      { nom: 'Helium 10', note: 'Suite complète (sourcing + recherche + PPC)', prix: 'Platinum 129$/mois, Diamond 359$/mois, Enterprise dès 1 499$/mois', source: 'https://www.helium10.com/pricing/' },
      { nom: 'Jungle Scout', note: 'Suite complète, positionnement établi', prix: 'Starter 49$/mois, Growth 79$/mois, Brand Owner 149$/mois', source: 'https://www.demandsage.com/jungle-scout-pricing/' },
      { nom: 'SellerAmp SAS', note: 'Positionnement le plus proche d\'Arbitrage+ (sourcing/arbitrage pur), extension Chrome incluse à tous les plans, 100 000+ utilisateurs revendiqués', prix: '19,95 à 49,95$/mois', source: 'https://selleramp.com/pricing/' },
    ],
    positionnement: 'SellerAmp démontre qu\'un outil de sourcing pur (sans suite complète) peut réussir sous les 20-50$/mois avec forte adoption — modèle le plus proche d\'Arbitrage+. L\'absence d\'extension Chrome (standard chez les 4 concurrents) est un écart concret à combler.',
  },
  'Analyzer+': {
    marche: 'Même contexte que Arbitrage+ (pas de rapport dédié) — voir ci-dessus.',
    sourcesMarche: ['https://www.skyquestt.com/report/e-commerce-software-market', 'https://thunderbit.com/blog/amazon-fba-stats'],
    concurrents: [
      { nom: 'Jungle Scout', note: 'Suite complète incluant recherche produit', prix: 'Starter 49$/mois, Growth 79$/mois, Brand Owner 149$/mois', source: 'https://www.demandsage.com/jungle-scout-pricing/' },
      { nom: 'Helium 10', note: 'Suite complète (Xray/Black Box pour la recherche produit)', prix: 'Platinum 129$/mois, Diamond 359$/mois', source: 'https://www.helium10.com/pricing/' },
      { nom: 'AMZScout', note: 'Positionnement le plus proche d\'Analyzer+ : analyse produit simple, orienté débutants', prix: 'AI Bundle 59,99$/mois ou 399,99$/an', source: 'https://revenuegeeks.com/amzscout-pricing/' },
    ],
    positionnement: 'AMZScout (positionnement simple/débutant, 59,99$/mois) est le comparable le plus proche d\'Analyzer+ — marge de différenciation possible sur le prix/l\'UX. 49 visiteurs/30j = premier signal de traction, encore très faible face aux volumes revendiqués par les concurrents (100k+ à "1M+ sellers").',
  },
  'Profit+': {
    marche: 'Même contexte (pas de rapport dédié au segment).',
    sourcesMarche: ['https://www.skyquestt.com/report/e-commerce-software-market'],
    concurrents: [
      { nom: 'Sellerboard', note: 'Cible de parité déjà identifiée en interne — fondé 2017 en Allemagne, 20k+ utilisateurs revendiqués, suite complète (COGS, PPC, inventaire, remboursements)', prix: 'Standard 19$/mois, Professional 29$/mois, Business 39$/mois, Enterprise 79$/mois', source: 'https://revenuegeeks.com/sellerboard-pricing/' },
      { nom: 'Helium 10 (module Profits)', note: 'Concurrent indirect — module intégré dans une suite plus large', prix: 'inclus dans Platinum 129$/mois', source: 'https://www.helium10.com/pricing/' },
    ],
    positionnement: 'Sellerboard segmente son offre sur 4 paliers (19-79$/mois) — de la place pour un positionnement prix d\'entrée ou des fonctionnalités inédites. La cible "100% de parité" est ambitieuse face à un acteur mature (2017, 20k+ utilisateurs) alors que Profit+ n\'a pas encore branché SP-API en réel.',
  },
  'École Connect': {
    marche: 'Filière EdTech française : 1,8 Md€ de CA en 2025 (+6%/an), 550 entreprises. Segment scolaire = 22% du CA (≈396 M€), avec des défaillances récentes constatées (dépendance à la commande publique).',
    sourcesMarche: ['https://edtechgrandouest.fr/filiere-edtech-france-2026-etude-ey-parthenon/'],
    concurrents: [
      { nom: 'Pronote (Index Éducation)', note: 'Standard historique collège/lycée, ~30 ans d\'ancienneté', prix: 'licence annuelle par établissement, ex. ~1 266€/an (illimité) + hébergement ~1 192€/an (tarifs 2023, derniers publiés)', source: 'https://www.index-education.com/fr/tarifs-pronote.php' },
      { nom: 'EcoleDirecte', note: 'App mobile forte, orienté communication famille, gratuit pour les familles', prix: 'sur devis (souscrit par l\'établissement)', source: 'https://lyceecharlesdegaulle.fr/ecole-directe-avis-prix/' },
      { nom: 'Beneylu School', note: 'Leader ENT primaire, prix unique quel que soit le nombre de classes/élèves', prix: '79 à 599€ TTC/an selon périmètre', source: 'https://fr.school.beneylu.com/prix' },
    ],
    positionnement: 'Marché fragmenté par segment (Pronote domine collège/lycée, Beneylu le primaire) — des niches restent possibles, mais le vrai risque identifié n\'est pas la concurrence : c\'est l\'état interne du projet lui-même (0 visiteur/30j, statut "à auditer", dernier suivi non retrouvé), à clarifier avec Julien avant toute analyse concurrentielle plus poussée.',
  },
  'CoursHub': {
    marche: 'Segment "formation professionnelle" = 44% du CA de l\'EdTech française (≈792 M€, sur 1,8 Md€ total). Marché e-learning mondial estimé 213,2 Md$ en 2026. Point réglementaire : participation CPF obligatoire de 100€, portée à 150€ en avril 2026 — a déjà fragilisé des acteurs dépendants du financement public.',
    sourcesMarche: ['https://edtechgrandouest.fr/filiere-edtech-france-2026-etude-ey-parthenon/', 'https://www.tudigo.com/ressources/blog/marche-edtech'],
    concurrents: [
      { nom: 'Podia', note: 'All-in-one créateur (cours + coaching + communauté), international', prix: '42 à 150$/mois (0 à 5% de frais selon plan)', source: 'https://www.podia.com/pricing' },
      { nom: 'LearnyBox', note: 'Historique marché francophone, tunnels de vente intégrés', prix: 'gratuit jusqu\'à 1 000€ de ventes, puis ~39 à 124€/mois', source: 'https://learnybox.com/tarifs-learnybox-essai-gratuit/' },
      { nom: 'Systeme.io', note: 'Rapport prix/fonctionnalités très agressif, 0% de frais de transaction', prix: 'gratuit à 97$/mois', source: 'https://systeme.io/pricing' },
      { nom: 'Teachizy', note: '100% française, positionnement "gratuit pour débuter"', prix: 'gratuit à vie, puis 49 à 990€ TTC', source: 'https://www.teachizy.fr/fonctionnalites-et-tarifs/' },
    ],
    positionnement: 'Marché déjà mature avec plusieurs offres gratuites généreuses (Systeme.io, LearnyBox, Teachizy) — le positionnement "simple + français + pas cher" est déjà validé viable par Teachizy. L\'IA de création de contenu reste un axe de différenciation encore peu exploité par ces 4 concurrents.',
  },
  'QuizPlay': {
    marche: 'Pas de chiffre isolé trouvé pour le sous-segment "quiz interactif" — classé dans la catégorie transversale "outils d\'évaluation/analytics" de l\'EdTech (recoupe scolaire 396 M€ et corporate learning B2B 396 M€ en France).',
    sourcesMarche: ['https://www.tudigo.com/ressources/blog/marche-edtech'],
    concurrents: [
      { nom: 'Kahoot!', note: 'Marque dominante, gamification', prix: 'gratuit limité (10 participants) ; pro 19 à 79€/mois (facturation annuelle)', source: 'https://www.wooclap.com/en/blog/kahoot-pricing/' },
      { nom: 'Wooclap', note: '21 types de questions, plan gratuit généreux, orienté enseignement supérieur', prix: 'gratuit jusqu\'à 1 000 participants/événement ; 8 à 25$/utilisateur/mois', source: 'https://www.wooclap.com/en/blog/kahoot-pricing/' },
      { nom: 'Quizizz (renommé Wayground)', note: 'Prix non trouvé (page en JS, produit a changé de marque en 2026) — à revérifier manuellement', prix: 'non trouvé', source: 'https://wayground.com/' },
      { nom: 'Kwizou', note: 'Alternative française gratuite et illimitée, hébergée en UE (IONOS Allemagne), argument RGPD/souveraineté', prix: '100% gratuit', source: 'https://www.kwizou.fr/' },
    ],
    positionnement: 'Barrière à l\'entrée quasi nulle sur ce type d\'outil (Kwizou est un entrant récent) — le créneau "RGPD + hébergement UE + gratuit" est prouvé viable sans être saturé, positionnement encore disponible pour QuizPlay si le différenciateur est confirmé avec Julien.',
  },
  'Agoeon (remake Patreon)': {
    marche: 'Creator economy : 191,55 Md$ (2025) → 248,95 Md$ (2026), projection 1 054,31 Md$ en 2033 (CAGR 22,9%).',
    sourcesMarche: ['https://www.demandsage.com/creator-economy-statistics/'],
    concurrents: [
      { nom: 'Patreon', note: 'Concurrent direct, source du remake', prix: 'commission flat 10% (nouveaux comptes depuis juin 2025) ; comptes "legacy" 5-11% ; +30% supplémentaires sur iOS (règle Apple depuis nov. 2024)', source: 'https://support.patreon.com/hc/en-us/articles/22581195376909-Creator-fees-FAQ' },
      { nom: 'Ko-fi', note: '0% sur pourboires ponctuels', prix: '5% flat sur adhésions/boutique + frais processeur', source: 'https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee' },
      { nom: 'Buy Me a Coffee', note: '—', prix: '5% + frais Stripe (~2,9% + 0,30$)', source: 'https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment' },
      { nom: 'Tipeee (FR)', note: 'Seul acteur francophone direct identifié', prix: '8% TTC + frais PayPal éventuels', source: 'https://help.tipeee.com/hc/fr/articles/360010326780-Quel-est-le-co%C3%BBt-du-service' },
      { nom: 'Substack', note: '—', prix: '10% + Stripe (~13-19% effectif combiné)', source: 'https://payoutmath.com/substack-fee-calculator/' },
    ],
    positionnement: 'Marché francophone peu disputé (Tipeee quasi seul, à 8%) — ouverture pour un acteur à commission plus faible que Patreon, dans un marché en très forte croissance. Statut réel du projet : gelé pour la commercialisation, développement continue.',
  },
  'Mym++ / Tinder++ (Tinder++)': {
    marche: 'Online dating services : 5,64 Md$ (2025) → 6,09 Md$ (2026), projection 12,06 Md$ en 2035 (CAGR 7,9%).',
    sourcesMarche: ['https://www.precedenceresearch.com/online-dating-services-market'],
    concurrents: [
      { nom: 'Tinder', note: 'Leader, appartient à Match Group', prix: 'Gold ~29,99$/mois, Platinum ~39,99$/mois', source: 'https://unstar.app/blog/tinder-gold-bumble-premium-hinge-plus-dating-paywalls-2026' },
      { nom: 'Bumble', note: 'Indépendant', prix: 'Premium ~32,99$/mois', source: 'https://unstar.app/blog/tinder-gold-bumble-premium-hinge-plus-dating-paywalls-2026' },
      { nom: 'Hinge', note: 'Appartient à Match Group', prix: 'Hinge+ ~32,99$/mois, HingeX ~49,99$/mois', source: 'https://unstar.app/blog/tinder-gold-bumble-premium-hinge-plus-dating-paywalls-2026' },
    ],
    positionnement: 'Marché à très fort effet de réseau, dominé par 3 acteurs aux budgets massifs (Tinder/Hinge = Match Group, Bumble indépendant). Statut réel : gelé pour la commercialisation — l\'effet de réseau (taille de base) est le facteur le plus critique dans ce secteur, et le gel prolongé fait perdre du terrain.',
  },
  'Mym++ / Tinder++ (Mym++)': {
    marche: 'Pas de taille de marché agrégée trouvée pour le segment "plateformes d\'abonnement de contenu adulte" — seul repère sourcé : OnlyFans seul a généré 6,3 Md$ de revenus bruts en 2024 (contre 300 M$ en 2019).',
    sourcesMarche: ['https://www.matthewball.co/all/ofpl'],
    concurrents: [
      { nom: 'OnlyFans', note: 'Leader ultra-dominant, 300M+ utilisateurs enregistrés', prix: 'commission 20% (split 80/20) uniforme', source: 'https://ofcpa.pro/shocking-truth-what-percentage-do-onlyfans-take-tax-tips' },
      { nom: 'MYM.fans (FR)', note: 'Seul acteur français direct identifié', prix: '75-80% reversés aux créateurs selon le type de contenu, + 7% de frais bancaires', source: 'https://www.studioinfluence.com/fr/mym-commission.html' },
      { nom: 'Fanvue', note: '—', prix: 'split standard 80/20', source: 'https://legal.fanvue.com/creator-earnings-payouts' },
    ],
    positionnement: 'Marché francophone partiellement occupé (MYM.fans identifié comme seul acteur FR direct) — espace de niche possible. Barrières réglementaires et de conformité fortes (vérification d\'âge, modération, paiement) propres à ce type de plateforme, non investiguées en détail ici. Statut réel : gelé pour la commercialisation.',
  },
  'NOVA ERP WEB (clone Odoo Website & eCommerce)': {
    marche: 'Marché mondial des plateformes e-commerce : 11,55 Md$ (2025) → 13,92 Md$ (2026) → 61,83 Md$ (2034), CAGR 20,49%.',
    sourcesMarche: ['https://www.fortunebusinessinsights.com/ecommerce-platform-market-111994'],
    concurrents: [
      { nom: 'Odoo', note: 'Source clonée', prix: 'Standard 31,10$/user/mois an 1 (38,90$ an 2+), Custom 61-76,20$/user/mois, "One App Free" gratuit', source: 'https://iventureteam.com/blog/odoo-pricing/' },
      { nom: 'Shopify', note: '—', prix: '39 à 2 300$/mois + commission carte 2,25 à 2,9%', source: 'https://costbench.com/software/ecommerce/shopify/' },
      { nom: 'PrestaShop', note: 'Cœur open-source déjà gratuit', prix: 'gratuit (auto-hébergé) à 2 115€+/mois (Enterprise)', source: 'https://belvg.com/blog/how-much-does-prestashop-cost.html' },
      { nom: 'WooCommerce', note: 'Cœur gratuit, coût réel dominé par dev/hébergement', prix: 'gratuit + hébergement 10-300$+/mois', source: 'https://wearepresta.com/is-woocommerce-free-in-2026-a-comprehensive-cost-analysis/' },
    ],
    positionnement: 'Le positionnement "clone moins cher qu\'Odoo" est cohérent face à Odoo/Shopify (SaaS payants), mais PrestaShop et WooCommerce occupent déjà le créneau gratuit/open-source — différenciateur réel du clone à définir avec Julien.',
  },
  'Marketplace-Sharetribe-Clone': {
    marche: 'Marché mondial des logiciels de plateforme marketplace : 12,4 Md$ (2025) → 28,7 Md$ (2034), CAGR 11,8%.',
    sourcesMarche: ['https://marketintelo.com/report/marketplace-platform-software-market'],
    concurrents: [
      { nom: 'Sharetribe', note: 'Source clonée', prix: '39 à 299$/mois selon quota de transactions, + 0,19$/transaction au-delà', source: 'https://www.trustradius.com/products/sharetribe/pricing' },
      { nom: 'Arcadier', note: '0% de commission plateforme (100% abonnement)', prix: '60 à 1 500$+/mois + implémentation 15-35k$', source: 'https://checkthat.ai/brands/arcadier/pricing' },
      { nom: 'CS-Cart Multi-Vendor', note: 'Existe en licence à vie (one-shot)', prix: '~689 à 2 879$/an, ou licence à vie 2 872 à 15 992$', source: 'https://www.cs-cart.com/compare' },
    ],
    positionnement: 'Sharetribe facture cher au-delà des quotas (0,19$/transaction + services tiers) — un clone auto-hébergé sans commission serait compétitif, sur le modèle déjà validé par Arcadier (abonnement sans commission) et CS-Cart (licence one-shot).',
  },
  'Frip (Vinted remake)': {
    marche: 'Marché mondial de la seconde main (mode) : projeté à 393 Md$ d\'ici 2030 (~10% des dépenses mode totales), croissance 2x plus rapide que le retail mode classique ; marché US seul projeté à 78,8 Md$ d\'ici 2030.',
    sourcesMarche: ['https://ir.thredup.com/news-releases/news-release-details/thredups-14th-annual-resale-report-reveals-new-era-structural'],
    concurrents: [
      { nom: 'Vinted', note: 'Cible du remake', prix: '0% de commission vendeur ; frais "protection acheteur" ~5% + 0,70$ côté acheteur', source: 'https://www.voolist.com/blog/vinted-fees-2026' },
      { nom: 'Vestiaire Collective', note: '—', prix: 'commission vendeur 12% + ~3% frais de traitement', source: 'https://faq.vestiairecollective.com/hc/en-gb/articles/42748412666897-Seller-Selling-Fees-until-January-11th-2026' },
      { nom: 'Depop', note: '—', prix: '0% de commission (US/UK) + 3,3%+0,45$ frais de traitement', source: 'https://sellerfeecalc.com/depop-fees' },
      { nom: 'Leboncoin', note: '—', prix: '0% de commission particuliers, frais "transaction sécurisée" côté acheteur', source: 'https://sequr.fr/blog/leboncoin-frais-vendeur-2026' },
    ],
    positionnement: 'ATTENTION — le schéma "clone moins cher" ne tient pas ici : Vinted, Depop et Leboncoin sont déjà à 0% de commission vendeur. Le différenciateur ne peut pas être le prix ; il doit être une niche géographique, catégorie, ou UX — à définir impérativement avec Julien. Marché porté par la Gen Z/Millennials (>70% de la croissance projetée d\'ici 2030).',
  },
};

// Concurrents réels trouvés pour le reste du portefeuille (recherche web du 24/08/2026, moins approfondie
// — pas de BMC/SWOT complet, juste des noms + une source, pour remplacer les "à confirmer").
const CONCURRENTS_PORTEFEUILLE = [
  { projet: 'Arbitrage+', concurrentsIdentifies: 'Keepa, Helium 10, Jungle Scout, SellerAmp', etat: 'fait', source: 'https://www.helium10.com/competitors/helium-10-vs-jungle-scout/' },
  { projet: 'Analyzer+', concurrentsIdentifies: 'Jungle Scout, Helium 10, AMZScout', etat: 'fait', source: 'https://amzscout.net/blog/amzscout-vs-jungle-scout-accuracy-comparison/' },
  { projet: 'Profit+', concurrentsIdentifies: 'Sellerboard (cible de parité), Fetcher, RestockPro', etat: 'fait', source: 'https://novadata.io/resources/blog/best-amazon-analytics-tools' },
  { projet: 'École Connect', concurrentsIdentifies: 'Pronote, EcoleDirecte, Beneylu School', etat: 'fait', source: 'https://www.aladom.fr/actualites/secteur-service/10050/educonnect-beneylu-pronote-toutatice-quelle-solution-pour-suivre-la-scolarite/' },
  { projet: 'CoursHub', concurrentsIdentifies: 'Podia, LearnyBox, Systeme.io, Teachizy', etat: 'fait', source: 'https://www.montersonbusiness.com/podia-vendre-formations-coaching/' },
  { projet: 'QuizPlay', concurrentsIdentifies: 'Kahoot, Quizizz, Wooclap, Kwizou (alternative FR RGPD)', etat: 'fait', source: 'https://www.wooclap.com/en/blog/kahoot-vs-wooclap/' },
  { projet: 'Agoeon (remake Patreon)', concurrentsIdentifies: 'Patreon (concurrent direct), Ko-fi, Buy Me a Coffee, Tipeee (FR), Substack', etat: 'fait', source: 'https://www.gumlet.com/learn/patreon-alternatives/' },
  { projet: 'Mym++ / Tinder++ (Tinder++)', concurrentsIdentifies: 'Tinder, Bumble, Hinge (Happn/Badoo plus secondaires en 2026)', etat: 'fait', source: 'https://www.datingnews.com/apps-and-sites/how-tinder-hinge-and-bumble-stack-up-entering-2026-with-grindr-gaining-ground/' },
  { projet: 'Mym++ / Tinder++ (Mym++)', concurrentsIdentifies: 'OnlyFans, MYM.fans (plateforme FR déjà existante — concurrent direct réel), Fanvue', etat: 'fait', source: 'https://www.webady.fr/digital/comparaison-entre-mym-fans-et-onlyfans-quelle-plateforme-est-la-meilleure-pour-gagner-de-largent/' },
  { projet: 'NOVA ERP WEB (clone Odoo Website & eCommerce)', concurrentsIdentifies: 'Odoo (référence officielle clonée), Shopify, PrestaShop, WooCommerce', etat: 'fait', source: 'https://www.odoo.com/page/odoo-vs-shopify' },
  { projet: 'Marketplace-Sharetribe-Clone', concurrentsIdentifies: 'Sharetribe (source du clone), Arcadier, CS-Cart Multi-Vendor', etat: 'fait', source: 'https://www.sharetribe.com/alternatives/cs-cart/' },
  { projet: 'Frip (Vinted remake)', concurrentsIdentifies: 'Vinted (cible du remake), Vestiaire Collective, Leboncoin, Depop', etat: 'fait', source: 'https://www.vinteer.io/blog/vinted-vs-vestiaire-vs-leboncoin' },
];

// BMC (9 blocs) + SWOT réels pour les 3 projets urgents — construits à partir des recherches ci-dessus
// + des faits internes déjà vérifiés dans le registre. Toute case incertaine dit "à valider avec Julien"
// plutôt que d'inventer.
const BMC_SWOT = {
  'CVDesignPro': {
    bmc: {
      segmentsClients: 'Demandeurs d\'emploi francophones (grand public) ; candidats visant des institutions internationales (formats Europass/OTAN) ; segment recruteurs potentiel si Bridge Law Services se concrétise (à valider avec Julien, encore au stade demande).',
      propositionValeur: 'CV gratuit et rapide sans compte, score ATS visible immédiatement ; Premium à prix bas vs concurrents (12,99€/mois, 39€/an) avec formats institutionnels différenciants + IA.',
      canaux: 'Site cvdesignpro.com/fr (660 visiteurs/30j, meilleur trafic du portefeuille) ; automatisation sociale Make existante mais invalide (scénario 9618460, 16 erreurs/20 exécutions) — canal social non opérationnel actuellement.',
      relationClient: 'Self-service (éditeur guidé) — pas de preuve de support dédié ou communauté (à valider avec Julien).',
      revenus: 'Abonnement Premium 12,99€/mois + 39€/an (validé 08/08/2026) ; volume d\'abonnés et taux de conversion réels : à valider avec Julien.',
      ressourcesCles: 'Plateforme web (éditeur, scoring ATS), modèles, marque cvdesignpro.com, automatisations Make (partiellement défaillantes).',
      activitesCles: 'Développement produit, acquisition de trafic, maintenance des automatisations, et si Bridge Law avance : module matching/diffusion multi-plateformes.',
      partenairesCles: 'Bridge Law Services / David Martin (demande en cours, non contractualisée — à valider avec Julien).',
      structureCouts: 'Hébergement Vercel, IA (traduction/réécriture, coût non trouvé), automatisation Make. Détail des coûts réels du projet : à valider avec Julien (Finance par projet pas encore taguée).',
    },
    swot: {
      forces: ['Trafic le plus élevé du portefeuille (660 visiteurs/30j)', 'Prix Premium nettement inférieur aux concurrents (12,99€/mois vs 24-30$/mois chez Zety/Resume.io/Novoresume/Kickresume/Rezi)', 'Différenciation crédible : formats institutionnels (Europass, DIGIT-TM, OTAN)', 'Demande client entrante réelle (Bridge Law Services) ouvrant une piste B2B'],
      faiblesses: ['Automatisation de publication sociale invalide (scénario Make 9618460), non corrigée', 'Aucune preuve de volume d\'abonnés/conversion/revenu récurrent réel — à valider avec Julien', 'Pas de fonctionnalités communautaires/carrière contrairement à Novoresume/Kickresume'],
      opportunites: ['Marché en croissance : Resume Builder +7,2% CAGR vers 12,55 Md$ (2030) ; AI Recruitment +7,5% CAGR', 'Bridge Law Services ouvrirait un segment B2B/marketplace peu couvert par les concurrents généralistes identifiés', 'Niche institutionnelle francophone (Europass/OTAN) peu disputée'],
      menaces: ['Concurrents mieux capitalisés (Zety, Resume.io, Kickresume, Rezi) pouvant baisser leurs prix promo', 'CVDesignR revendique déjà 5M de candidats francophones — concurrent direct le mieux implanté', 'Dépendance à un seul canal d\'acquisition (trafic organique), pas de social fonctionnel', 'Relation Bridge Law Services non garantie contractuellement'],
    },
  },
  'Pet Stone': {
    bmc: {
      segmentsClients: 'Acheteurs de cadeaux insolites/humoristiques (anniversaires, fêtes calendaires), probablement 20-45 ans, France + Belgique (page Facebook "Brussels" — pays cible réel à valider avec Julien).',
      propositionValeur: '« Animal de compagnie » sans contrainte (zéro entretien/frais vétérinaire), humour + storytelling (certificat d\'adoption, guide de dressage), éditions saisonnières pour les pics cadeaux.',
      canaux: 'Site pet-stone.shop (Odoo, actuellement cassé — /shop affiche "No product defined") ; Amazon annoncé comme canal prioritaire ; Etsy ; Facebook + LinkedIn actifs via Make (réactivé 24/08) ; Instagram/TikTok/YouTube non connectés.',
      relationClient: 'Largement transactionnelle e-commerce, peu d\'éléments de fidélisation identifiés — à valider avec Julien.',
      revenus: 'Vente directe des boîtes (24,78 à 59€ selon édition) + Amazon/Etsy ; répartition du CA entre canaux à valider avec Julien.',
      ressourcesCles: 'Marque "Pet Stone" (éditions saisonnières), backend Odoo, comptes sociaux Facebook/LinkedIn actifs.',
      activitesCles: 'Production/conditionnement des boîtes-cadeaux, contenu réseaux sociaux, gestion Amazon/Etsy.',
      partenairesCles: 'Amazon, Etsy comme canaux de vente ; fournisseurs de pierres/emballage à valider avec Julien.',
      structureCouts: 'Non documenté publiquement — à valider avec Julien (production, logistique, pub, Make/Odoo).',
    },
    swot: {
      forces: ['Concept différenciant et mémorable (humour, storytelling)', '5 éditions saisonnières déjà en place', 'Automatisation sociale opérationnelle (Facebook + LinkedIn réels via Make)', 'Présence multicanal déjà amorcée (site, Amazon, Etsy)'],
      faiblesses: ['Vente directe cassée en ce moment (/shop "No product defined" côté Odoo) — bloque la conversion sur le canal propriétaire', 'Dépendance annoncée à Amazon comme canal prioritaire (perte de marge/contrôle client)', 'Instagram/TikTok non connectés alors que le produit est très propice au contenu viral court', 'Ambiguïté géographique (page Facebook "Brussels" vs marché visé) à clarifier'],
      opportunites: ['Marché du cadeau insolite en France décrit comme le plus développé d\'Europe (Businesscoot)', 'Format très adapté à TikTok/Instagram (humour, unboxing), canaux non exploités', 'Nouvelles éditions saisonnières possibles au-delà des 5 actuelles'],
      menaces: ['Le bug /shop cassé transforme toute action marketing (posts Facebook/LinkedIn en cours) en trafic perdu — priorité de correction immédiate', 'Concurrence Etsy nombreuse et à bas prix sur le concept "pet rock"', 'Marché du coffret-cadeau en France décrit en maturité/ralentissement depuis 2016', 'Confusion de marque possible avec les vrais acteurs "lithothérapie pour animaux" (JoyDogCat etc.), vocabulaire proche mais produit différent'],
    },
  },
  'Content Engine DYONYSOS': {
    swot: {
      forces: ['Infrastructure Make déjà partiellement construite (7 scénarios recensés dans Réseaux sociaux)', 'Sert plusieurs projets du portefeuille à la fois (mutualisation) une fois opérationnel'],
      faiblesses: ['Bloque Pilotage Social tant que le classeur Sheets "PROJECTS" reste vide (xlsx pas importé)', 'Scénario générique "[CE] A/B/C/D" inactif'],
      opportunites: ['Automatisation multi-canal (MarTech) en croissance générale — pas de chiffre spécifique trouvé, non recherché en profondeur pour cet outil interne'],
      menaces: ['Tant que le classeur reste vide, aucun projet ne bénéficie de la publication automatisée générique — coût d\'opportunité sur tous les autres projets'],
      note: 'Outil interne (pas un produit vendu) — pas de BMC ni de recherche concurrentielle externe pertinente ici, contrairement à CVDesignPro/Pet Stone.',
    },
  },
  // --- Les 11 autres projets, ajoutés le 24/08/2026 (soir) sur demande explicite de Julien ("de suite").
  'Arbitrage+': {
    bmc: {
      segmentsClients: 'Vendeurs pratiquant l\'arbitrage retail/online sur Amazon — profil précis à valider avec Julien.',
      propositionValeur: 'Sourcing/scoring d\'opportunités via données Keepa (+ SP-API à venir) ; différenciateur visé = extension Chrome (absente aujourd\'hui, standard chez les 4 concurrents).',
      canaux: 'App web (arbitrage-pro-app.vercel.app), 0 visiteur mesuré/30j. Extension Chrome en développement.',
      relationClient: 'Self-service — support/communauté à valider avec Julien.',
      revenus: 'Non définis, Stripe en dernière étape d\'intégration — à valider avec Julien.',
      ressourcesCles: 'API Keepa (Starter souscrite, 49€/mois), accès SP-API demandé, app Vercel.',
      activitesCles: 'Retrait des données simulées restantes, développement extension Chrome, finalisation Stripe.',
      partenairesCles: 'Keepa, Amazon SP-API (accès en cours), Vercel, Stripe.',
      structureCouts: 'Keepa Starter 49€/mois confirmé, infra Vercel ; coûts dev/équipe/acquisition à valider avec Julien.',
    },
    swot: {
      forces: ['Accès Keepa Starter déjà opérationnel', 'App déployée', 'Feuille de route claire (extension Chrome, Stripe)'],
      faiblesses: ['0 visiteur mesuré/30j', 'Données encore simulées dans certains modules', 'Pas d\'extension Chrome alors que c\'est un standard chez les 4 concurrents identifiés', 'Stripe non branché'],
      opportunites: ['2,5M+ vendeurs Amazon actifs dans le monde', 'SellerAmp démontre qu\'un outil de sourcing pur peut réussir sous les 20-50$/mois avec forte adoption (100k+ utilisateurs)'],
      menaces: ['Marché mature/consolidé (Keepa = quasi-standard data, SellerAmp sur le même usage exact)', 'Coûts API Keepa croissants avec le volume (jusqu\'à 11k€/mois aux paliers élevés)', 'Aucune traction actuelle à convertir avant tout lancement payant'],
    },
  },
  'Analyzer+': {
    bmc: {
      segmentsClients: 'Vendeurs Amazon en phase de recherche/analyse produit — profil à valider avec Julien.',
      propositionValeur: 'Analyse produit avec authentification réelle et favoris/notes persistants (P0 fait) ; différenciateur visé = historique + données marché réelles.',
      canaux: 'App web (analyzer-plus-preview.vercel.app), 49 visiteurs/30j mesurés.',
      relationClient: 'Auth Supabase self-service — support à valider avec Julien.',
      revenus: 'Non définis — modèle probable freemium/abonnement comparable à AMZScout (59,99$/mois) ou Jungle Scout Starter (49$/mois) — à valider avec Julien.',
      ressourcesCles: 'Infra Supabase (auth+DB), app Vercel, accès Keepa/SP-API à câbler.',
      activitesCles: 'Câblage de l\'historique ap_history, remplacement des données démo par données marché réelles (Keepa/SP-API).',
      partenairesCles: 'Supabase, Vercel, Keepa/Amazon SP-API (à finaliser).',
      structureCouts: 'Infra Supabase/Vercel, futur coût API data — montants à valider avec Julien.',
    },
    swot: {
      forces: ['P0 livré (auth réelle + persistance favoris/notes)', '49 visiteurs/30j = premier signal de traction non nul'],
      faiblesses: ['Données marché encore de démo (pas Keepa/SP-API réelles)', 'Historique ap_history pas encore câblé', 'Trafic très faible face aux concurrents (SellerAmp 100k+, Jungle Scout "1M+ sellers")'],
      opportunites: ['Segment proche d\'AMZScout (positionnement simple/débutant à 59,99$/mois) — marge de différenciation prix/UX', '2,5M+ vendeurs Amazon actifs'],
      menaces: ['Concurrents établis avec suites complètes (Helium10 Diamond 359$/mois, Jungle Scout Brand Owner 149$/mois) pouvant absorber le besoin dans une offre plus large', 'Dépendance à un accès SP-API/Keepa non encore branché'],
    },
  },
  'Profit+': {
    bmc: {
      segmentsClients: 'Vendeurs Amazon FBA cherchant à suivre marge/rentabilité par produit — profil à valider avec Julien.',
      propositionValeur: 'Calcul de rentabilité/marge avec auth réelle et watchlist par utilisateur (P0 répliqué), objectif = parité fonctionnelle avec Sellerboard + fonctionnalités nouvelles.',
      canaux: 'App web (profit-plus-preview.vercel.app), 30 visiteurs/30j mesurés.',
      relationClient: 'Auth réelle self-service — support à valider avec Julien.',
      revenus: 'Non définis — cible probable un pricing compétitif face à Sellerboard (19-79$/mois) — à valider avec Julien.',
      ressourcesCles: 'Infra auth+DB, accès SP-API à câbler (pas encore fait), app Vercel.',
      activitesCles: 'Branchement SP-API réelle, développement des fonctionnalités manquantes pour la parité Sellerboard, puis différenciation.',
      partenairesCles: 'Amazon SP-API (à finaliser), Vercel, fournisseur auth/DB.',
      structureCouts: 'Infra technique, futur coût SP-API — montants à valider avec Julien.',
    },
    swot: {
      forces: ['P0 répliqué (auth réelle + watchlist par utilisateur)', 'Cible de parité claire avec un concurrent bien identifié', '30 visiteurs/30j = signal initial'],
      faiblesses: ['SP-API pas encore branchée en réel (pas de rentabilité calculée sur données live)', 'Trafic très faible (30/30j) vs Sellerboard (20k+ utilisateurs revendiqués)', 'Écart fonctionnel encore à combler pour la parité visée'],
      opportunites: ['2,5M+ vendeurs FBA actifs', 'Sellerboard segmente son offre sur 4 paliers (19-79$/mois), laissant de la place pour un positionnement prix d\'entrée ou des fonctionnalités inédites'],
      menaces: ['Sellerboard est un acteur mature (fondé 2017) avec suite complète (COGS, PPC, inventaire, remboursements)', 'Helium10 propose un module "Profits" intégré pouvant capter les mêmes utilisateurs', 'Risque d\'exécution pour atteindre "100% de parité" avant d\'avoir une base d\'utilisateurs'],
    },
  },
  'École Connect': {
    bmc: {
      segmentsClients: 'Établissements scolaires (primaire/collège/lycée ?) — à valider avec Julien.',
      propositionValeur: 'Plateforme de gestion d\'établissement scolaire — différenciateur non défini vs Pronote/EcoleDirecte/Beneylu — à valider avec Julien.',
      canaux: '0 visiteur mesuré sur 30j — à valider avec Julien.',
      relationClient: 'À valider avec Julien.',
      revenus: 'Probablement abonnement établissement (norme du marché) — montant à valider avec Julien.',
      ressourcesCles: 'Plateforme déployée (ecole-connect-pied.vercel.app).',
      activitesCles: 'État de développement flou (actif/abandonné ?) — à valider avec Julien.',
      partenairesCles: 'Aucun identifié — à valider avec Julien.',
      structureCouts: 'Hébergement Vercel + dev — montants à valider avec Julien.',
    },
    swot: {
      forces: ['Plateforme déjà techniquement développée et déployée', 'Marché scolaire réel et structuré (≈396 M€ en France)'],
      faiblesses: ['0 visiteur mesuré sur 30 jours, statut "à auditer", suivi perdu — signal fort d\'un projet en pause ou à l\'abandon', 'Aucune différenciation connue face à des leaders installés depuis 20-30 ans', 'Positionnement produit non défini'],
      opportunites: ['Marché fragmenté par segment (Pronote domine collège/lycée, Beneylu le primaire) — niches encore possibles', 'Transformation numérique continue des établissements'],
      menaces: ['Le principal risque est interne — l\'abandon apparent du projet lui-même, avant même la concurrence', 'Concurrents à base clients captive (les établissements changent rarement de logiciel de vie scolaire)', 'Segment scolaire EdTech fragile en France (défaillances récentes constatées)'],
    },
  },
  'CoursHub': {
    bmc: {
      segmentsClients: 'Formateurs indépendants, infopreneurs, organismes de formation — à valider avec Julien.',
      propositionValeur: 'Plateforme de vente de formations en ligne — différenciateur vs Podia/Systeme.io/LearnyBox/Teachizy non défini — à valider avec Julien.',
      canaux: 'À valider avec Julien.',
      relationClient: 'À valider avec Julien.',
      revenus: 'Abonnement mensuel/annuel probable (norme du secteur) — montant à valider avec Julien.',
      ressourcesCles: 'Plateforme déployée (coursehub-dusky-seven.vercel.app).',
      activitesCles: 'État d\'avancement produit à valider avec Julien.',
      partenairesCles: 'Paiement (Stripe/PayPal probable) — à valider avec Julien.',
      structureCouts: 'Hébergement + dev — à valider avec Julien.',
    },
    swot: {
      forces: ['Segment porteur (le plus gros de l\'EdTech française, 44% du CA)', 'Plateforme déployée'],
      faiblesses: ['Marché déjà mature et très concurrentiel, avec des offres gratuites généreuses chez plusieurs leaders (Systeme.io Free, LearnyBox gratuit à vie, Teachizy gratuit)', 'Traction et différenciation actuelles non mesurées'],
      opportunites: ['Positionnement "simple + français + pas cher" déjà validé comme viable (Teachizy)', 'IA de création de contenu = axe de différenciation encore ouvert chez ces 4 concurrents'],
      menaces: ['Instabilité réglementaire du CPF (a déjà fragilisé des acteurs du secteur)', 'Concurrence internationale forte (Podia)', 'SEO/notoriété déjà largement captés par les leaders'],
    },
  },
  'QuizPlay': {
    bmc: {
      segmentsClients: 'Enseignants, formateurs, entreprises — à valider avec Julien.',
      propositionValeur: 'Outil de quiz interactif — différenciateur vs Kahoot/Wooclap/Quizizz/Kwizou non défini — à valider avec Julien.',
      canaux: 'À valider avec Julien.',
      relationClient: 'À valider avec Julien.',
      revenus: 'Modèle non défini (gratuit/freemium comme la norme du marché ?) — à valider avec Julien.',
      ressourcesCles: 'Plateforme déployée (quizplay-production.up.railway.app).',
      activitesCles: 'État d\'avancement produit à valider avec Julien.',
      partenairesCles: 'Aucun identifié — à valider avec Julien.',
      structureCouts: 'Hébergement Railway + dev — à valider avec Julien.',
    },
    swot: {
      forces: ['Catégorie EdTech établie avec demande confirmée (évaluation/analytics)', 'Plateforme déployée'],
      faiblesses: ['Marché ultra-concurrentiel avec des leaders mondiaux offrant du gratuit très généreux (Wooclap jusqu\'à 1 000 participants gratuits, Kahoot 10 joueurs gratuits)', 'Traction et différenciation non mesurées'],
      opportunites: ['Le créneau "RGPD + hébergement UE + gratuit" est déjà prouvé viable par un concurrent direct (Kwizou) sans être saturé'],
      menaces: ['Barrière à l\'entrée quasi nulle (de nouveaux entrants gratuits apparaissent régulièrement)', 'Marques fortes déjà ancrées dans l\'Éducation nationale (Kahoot, Wooclap)'],
    },
  },
  'Agoeon (remake Patreon)': {
    bmc: {
      segmentsClients: 'Créateurs de contenu cherchant un revenu récurrent + leurs abonnés/fans. Ciblage précis à valider avec Julien.',
      propositionValeur: 'Alternative à Patreon (paliers 2-3 max, produits digitaux, contenu déverrouillable à l\'unité, objectif de financement — guide interne). Différenciation concrète vs Patreon à valider avec Julien.',
      canaux: 'Aucun actif — projet gelé pour la commercialisation uniquement.',
      relationClient: 'Segmentation communauté prévue dans le guide interne, mais aucun programme actif tant que gelé.',
      revenus: 'Modèle-cible = commission sur abonnements créateurs, fourchette concurrentielle 5-12% + frais de traitement — aucune activité commerciale actuelle.',
      ressourcesCles: 'Code déployé (remake-patreon-082026.vercel.app), guide de croissance interne.',
      activitesCles: 'Développement produit continu (confirmé) ; pas d\'acquisition/commercialisation active.',
      partenairesCles: 'Hébergement Vercel ; processeur de paiement à valider avec Julien.',
      structureCouts: 'Coûts de développement continu + hébergement ; budget précis à valider avec Julien.',
    },
    swot: {
      forces: ['Concept éprouvé sur un marché en très forte croissance (+22,9% CAGR)', 'Guide de croissance interne déjà structuré', 'Stack technique déployée et fonctionnelle'],
      faiblesses: ['Statut "gelé pour la commercialisation" = zéro revenu, zéro utilisateur actif malgré développement continu', 'Différenciation vs Patreon non démontrée en externe', 'Doublon potentiel avec le projet interne "Kreo" (même concept) = risque de dispersion des ressources'],
      opportunites: ['Marché creator economy en expansion rapide', 'Mécontentement historique des créateurs vis-à-vis des commissions Patreon — ouverture pour un acteur à commission plus faible', 'Marché francophone peu disputé (Tipeee quasi seul, 8%)'],
      menaces: ['Écosystème installé à fort effet de réseau (Patreon, Substack, Ko-fi, BMC, Tipeee)', 'Risque de commission Apple 30% si extension mobile iOS', 'Pendant le gel, le marché et les concurrents continuent d\'évoluer'],
    },
  },
  'Mym++ / Tinder++': {
    swot: {
      note: 'Deux apps distinctes sous ce même projet du registre — BMC et SWOT séparés ci-dessous. Les deux sont "gelées pour la commercialisation uniquement — développement continue" (statut interne confirmé).',
      forces: ['Développement maintenu en continu sur les deux apps malgré le gel commercial'],
      faiblesses: ['Statut "gelé pour la commercialisation" = zéro utilisateur, zéro effet de réseau sur les deux apps — facteur pourtant critique dans ces deux secteurs'],
      opportunites: ['Marchés en croissance (dating +7,9% CAGR ; creator economy adulte, cf. trajectoire OnlyFans x21 en 5 ans)'],
      menaces: ['Écosystèmes installés à très fort effet de réseau des deux côtés (Tinder/Hinge/Bumble ; OnlyFans/MYM.fans)', 'Gel prolongé = retard cumulatif face à des concurrents qui itèrent en continu'],
    },
    bmcTinderpp: {
      segmentsClients: 'Utilisateurs cherchant des rencontres. Ciblage précis (niche, zone géo) à valider avec Julien.',
      propositionValeur: 'App de rencontre concurrente à Tinder/Bumble/Hinge — différenciateur non documenté en recherche externe, à valider avec Julien.',
      canaux: 'Aucun actif — gelé pour la commercialisation.',
      revenus: 'Modèle sectoriel standard = freemium + abonnement premium (~30-40$/mois chez les concurrents) + achats à l\'unité — aucune activité commerciale actuelle.',
      ressourcesCles: 'Build applicatif existant, développement continu confirmé.',
      activitesCles: 'Développement produit continu (confirmé) ; pas d\'acquisition utilisateurs.',
      structureCouts: 'Développement continu + infra ; budget à valider avec Julien.',
    },
    bmcMympp: {
      segmentsClients: 'Créateurs de contenu par abonnement + leurs abonnés. Ciblage précis à valider avec Julien.',
      propositionValeur: 'Plateforme d\'abonnement type OnlyFans/MYM.fans — différenciateur non documenté en recherche externe, à valider avec Julien.',
      canaux: 'Aucun actif — gelé pour la commercialisation.',
      revenus: 'Modèle sectoriel standard = commission sur abonnements/pourboires/PPV, concurrents entre 20-25% effectifs — aucune activité commerciale actuelle.',
      ressourcesCles: 'Build applicatif existant, développement continu confirmé.',
      activitesCles: 'Développement produit continu (confirmé) ; pas de commercialisation active.',
      structureCouts: 'Développement continu + infra + coûts de conformité/modération/vérification d\'âge probables (non détaillés) ; budget à valider avec Julien.',
    },
  },
  'NOVA ERP WEB (clone Odoo Website & eCommerce)': {
    bmc: {
      segmentsClients: 'PME/indépendants cherchant un site e-commerce sans dépendre d\'un SaaS payant récurrent — à valider avec Julien.',
      propositionValeur: 'Mêmes fonctionnalités qu\'Odoo Website/eCommerce, moins cher, auto-hébergeable — cohérent face à Odoo Enterprise/Shopify, mais différenciation faible face à PrestaShop/WooCommerce déjà gratuits — à valider avec Julien.',
      canaux: 'Non trouvé (interne) — à valider avec Julien.',
      relationClient: 'Non trouvé (interne) — à valider avec Julien.',
      revenus: 'Hypothèse SaaS/abonnement ou licence one-shot type CS-Cart — à valider avec Julien.',
      ressourcesCles: 'Code cloné, hébergement — état d\'avancement réel à valider avec Julien.',
      activitesCles: 'Maintenance du clone, sécurité, support — à valider avec Julien.',
      partenairesCles: 'Hébergeurs, passerelles de paiement — non trouvé (interne).',
      structureCouts: 'Développement/maintenance (poste dominant selon retours WooCommerce/PrestaShop), hébergement — montants non trouvés (interne).',
    },
    swot: {
      forces: ['Marché en forte croissance (CAGR ~20,5%)', 'Positionnement prix potentiellement agressif vs Shopify/Odoo Enterprise'],
      faiblesses: ['Concurrence déjà gratuite et mature (PrestaShop, WooCommerce) sur le créneau "open-source moins cher"', 'État d\'avancement du clone non vérifié'],
      opportunites: ['Marché e-commerce SaaS en expansion rapide', 'TCO réel des concurrents souvent mal compris (coûts cachés Shopify/WooCommerce) — argument commercial possible'],
      menaces: ['Odoo et Shopify dominants avec écosystèmes établis', 'PrestaShop/WooCommerce occupent déjà le créneau gratuit/auto-hébergé'],
    },
  },
  'Marketplace-Sharetribe-Clone': {
    bmc: {
      segmentsClients: 'Porteurs de projet marketplace multi-vendeurs cherchant une alternative moins chère à Sharetribe/Arcadier — à valider avec Julien.',
      propositionValeur: 'Mêmes fonctionnalités que Sharetribe, moins cher et/ou auto-hébergé — cohérent : Sharetribe facture 99-299$/mois + frais/transaction au-delà des quotas.',
      canaux: 'Non trouvé (interne) — à valider avec Julien.',
      relationClient: 'Non trouvé (interne) — à valider avec Julien.',
      revenus: 'Hypothèse abonnement ou licence — à valider avec Julien.',
      ressourcesCles: 'Code cloné, infra d\'hébergement — état d\'avancement à valider avec Julien.',
      activitesCles: 'Maintenance, évolutions du clone — à valider avec Julien.',
      partenairesCles: 'Stripe/passerelles de paiement, hébergeurs.',
      structureCouts: 'Développement, hébergement — montants réels non trouvés (interne).',
    },
    swot: {
      forces: ['Marché en croissance à deux chiffres (CAGR 11,8%)', 'Le modèle "abonnement sans commission" (Arcadier) et la licence one-shot (CS-Cart) prouvent une demande pour sortir du modèle Sharetribe'],
      faiblesses: ['Arcadier et CS-Cart occupent déjà le créneau "pas de commission / licence"', 'Différenciateur réel du clone non défini'],
      opportunites: ['Sharetribe facture cher au-delà des quotas (0,19$/transaction + services tiers) — argument prix exploitable'],
      menaces: ['Trois concurrents établis (Sharetribe, Arcadier, CS-Cart) avec écosystèmes déjà en place', 'Coûts d\'implémentation marketplace généralement élevés (15-35k$ chez Arcadier) — barrière à l\'entrée aussi pour les clients du clone'],
    },
  },
  'Frip (Vinted remake)': {
    bmc: {
      segmentsClients: 'Particuliers vendeurs/acheteurs de vêtements d\'occasion — marché géographique cible et niche vestimentaire à valider avec Julien.',
      propositionValeur: 'ATTENTION — le schéma "clone = moins cher" ne tient pas : Vinted, Depop et Leboncoin sont déjà à 0% de commission vendeur. Le différenciateur doit être ailleurs (niche, UX, géographie, catégorie non couverte) — à valider impérativement avec Julien.',
      canaux: 'Non trouvé (interne) — à valider avec Julien.',
      relationClient: 'Non trouvé (interne) — à valider avec Julien.',
      revenus: 'Par analogie au marché (frais acheteur + boosts payants, comme Vinted/Leboncoin) plutôt que commission vendeur — à valider avec Julien.',
      ressourcesCles: 'Code du remake, modération, base vendeurs — état d\'avancement à valider avec Julien.',
      activitesCles: 'Modération contenu/fraude, acquisition vendeurs (effet réseau critique sur ce marché) — à valider avec Julien.',
      partenairesCles: 'Transporteurs/logistique retour, prestataires paiement.',
      structureCouts: 'Développement, modération, acquisition (effet réseau coûteux à amorcer) — montants non trouvés (interne).',
    },
    swot: {
      forces: ['Marché de la seconde main en très forte croissance structurelle (2x le retail mode classique, 393 Md$ visés en 2030)'],
      faiblesses: ['Le positionnement "clone moins cher" est inopérant face à un leader déjà gratuit pour les vendeurs (Vinted)', 'Effet de réseau très difficile à répliquer pour un nouvel entrant', 'Différenciateur réel non défini'],
      opportunites: ['Marché porté par la Gen Z/Millennials (>70% de la croissance projetée d\'ici 2030)', 'Segments encore mal couverts par les leaders (niche géographique ou catégorie) potentiellement exploitables'],
      menaces: ['Quatre concurrents installés avec base d\'utilisateurs massive (Vinted, Vestiaire Collective, Leboncoin, Depop)', 'Barrière à l\'entrée liée à l\'effet de réseau (marketplace C2C) très forte'],
    },
  },
};

module.exports = { COMPETITORS_REAL, CONCURRENTS_PORTEFEUILLE, BMC_SWOT };
