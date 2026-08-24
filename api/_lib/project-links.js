// Mapping projet -> éligibilité Taiga / Odoo, généré le 24/08/2026 par une analyse automatique
// (Claude) du registre de projets (api/_lib/registry.js + suivi-projets.js). Les clés sont les
// "name" exacts tels qu'ils apparaissent dans le registre.
//
// taigaProjectSlug et odooCompanyId restent volontairement à `null` : ils seront renseignés plus
// tard, une fois les vrais projets Taiga créés et la société/le partenaire Odoo correspondant
// identifié dans Odoo Dyonysos.
//
// IMPORTANT : ce fichier est une classification automatique à partir du texte existant du
// registre, PAS un audit fait avec Julien. Il doit être relu par Julien avant d'être considéré
// comme définitif — en particulier chaque entrée avec odooEligible=true, qui engage une décision
// business (créer une société/un flux de facturation Odoo pour ce projet) et ne doit pas être
// actée sans validation explicite. Voir RAPPORT-MAPPING-PROJETS-ODOO-TAIGA.md à la racine du dépôt
// pour le détail lisible de cette analyse.

const PROJECT_LINKS = {
  "dyonysos-site (site principal + espace privé)": {
    typeProjet: "inconnu",
    taigaEligible: true,
    taigaReason: "Développement actif documenté : dernierPilotage = 'Claude — 23/08/2026 (module Pilotage Social + registre + onglets)', et la note signale un push en attente d'autorisation de session — activité de dev réelle et récente.",
    odooEligible: false,
    odooReason: "Aucune preuve de commandes, paiements ou clients pour ce projet dans le registre (pas de champ etat/taches mentionnant une activité commerciale) — c'est le site principal/back-office, pas un canal de vente documenté.",
    incertitude: "Le site est en ligne (url dyonysos.fr) et en développement actif, mais aucun champ etat/priorite/taches ne donne de chiffre de trafic ni de preuve d'activité utilisateur ou de paiement — impossible de trancher entre vitrine et test sans inventer une donnée.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Content Engine DYONYSOS": {
    typeProjet: "test_demo",
    taigaEligible: true,
    taigaReason: "4 tâches actives listées (import xlsx, revalidation des sélecteurs Sheets dans Make, garde-fou PR-008, tests T1-T12) avec priorité 'urgent (bloque Pilotage Social)' — développement en cours documenté.",
    odooEligible: false,
    odooReason: "Outil interne d'automatisation de contenu (Make + Google Sheets, piloté depuis /pilotage-social) — aucune mention de clients, commandes ou paiements dans etat/taches/note.",
    incertitude: "",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Cockpit adresses projets (ancien)": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches renseigné ; la note le décrit comme 'registre statique antérieur' 'à terme remplacé/complété' — aucune activité de développement en cours documentée.",
    odooEligible: false,
    odooReason: "Aucune donnée commerciale (clients, commandes, paiements) mentionnée pour cet outil de pilotage interne.",
    incertitude: "La note ('registre statique antérieur', 'à terme remplacé') suggère fortement un outil en voie d'abandon/remplacement, proche de 'gelé', mais le registre n'emploie pas explicitement ces mots ni ne donne d'etat — laissé en 'inconnu' plutôt que d'inférer.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "CVDesignPro": {
    typeProjet: "live_facturation",
    taigaEligible: true,
    taigaReason: "État priorité 'urgent', trafic mesuré réel le plus fort du portefeuille (660/969 visiteurs/30j), et une liste de tâches concrètes en cours (deadline 24/08 pour David Martin, rendu mobile à corriger, comparaison prévisions vs réel).",
    odooEligible: true,
    odooReason: "registry.js indique explicitement 'Créer le plan Stripe Premium 12,99€/mois + 39€/an (tarifs validés 08/08)' dans taches — c'est une offre payante validée en cours d'implémentation, avec un client identifié (David Martin, Bridge Law Services) demandant des fonctionnalités de recrutement.",
    incertitude: "Le plan Stripe est décrit comme 'à créer' dans les tâches, donc l'abonnement payant n'est pas encore confirmé actif/facturé au moment de la rédaction — l'éligibilité Odoo repose sur une activité commerciale imminente/validée plutôt que déjà constatée en paiement effectif.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "QuizPlay": {
    typeProjet: "inconnu",
    taigaEligible: true,
    taigaReason: "suivi-projets.js montre une activité de développement réelle et détaillée (MVP Node/Express/Socket.io fonctionnel, refonte graphique, nombreuses tâches 'Fait'/'À faire'/'Demandé' datées 01-02/08/2026), signe d'un pilotage actif.",
    odooEligible: false,
    odooReason: "Le modèle de tarification (5€/mois au-delà d'un seuil gratuit) est explicitement qualifié de 'décision initiale... à affiner... avant mise en prod' et 'a voir' par Julien lui-même — aucun paiement réel ni client facturé n'est documenté.",
    incertitude: "registry.js ne donne ni url de statut trafic ni étape 'etat' pour ce projet (seulement url/github/drive) ; impossible de dire si le site est en ligne avec du trafic réel ou encore en test — typeProjet laissé à 'inconnu' faute de donnée etat/priorite/note dans registry.js.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "CoursHub": {
    typeProjet: "inconnu",
    taigaEligible: true,
    taigaReason: "suivi-projets.js documente une activité de développement active et détaillée sur ce projet (MVP1-4 'Fait', tâches 'À faire'/'Demandé' datées 01-02/08/2026, décisions de Julien consignées).",
    odooEligible: false,
    odooReason: "Le paiement réel (Stripe) est listé comme 'À faire' — 'MVP4 complet + conformité DAC7' non traité ; la vente avec cession de PI est explicitement qualifiée d''achat mock' dans suivi-projets.js, donc aucune activité commerciale réelle documentée.",
    incertitude: "registry.js ne fournit pas de champ etat/priorite pour CoursHub (seulement url/github/drive) ; aucune mesure de trafic ou de lancement réel n'est indiquée — typeProjet laissé à 'inconnu'.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "École Connect": {
    typeProjet: "test_demo",
    taigaEligible: false,
    taigaReason: "registry.js indique explicitement '0 visiteur mesuré sur 30j — pas de suivi récent en mémoire, état réel à vérifier' et priorite 'à auditer', avec pour seule tâche listée 'Faire un état des lieux (dernier point de suivi non retrouvé)' — pas d'activité de développement active documentée actuellement, malgré un historique de dev (suivi-projets.js) daté du 01/08.",
    odooEligible: false,
    odooReason: "Aucune preuve de paiement, client ou commande réelle — c'est un projet en phase de cadrage/prototype (RGPD/DPIA, SSO/RBAC encore 'À faire' selon suivi-projets.js) sans activité commerciale.",
    incertitude: "suivi-projets.js montre un travail de développement conséquent daté du 01/08/2026 (fonctionnalités 'Fait'), mais registry.js (23/08) dit '0 visiteur mesuré' et 'pas de suivi récent en mémoire' — contradiction temporelle entre les deux sources, d'où la classification 'test_demo' prudente plutôt que 'live_vitrine'.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Portefeuille de démonstrations (apps mobiles)": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches/note dans registry.js, et aucune entrée correspondante dans suivi-projets.js — aucune activité de développement documentée à suivre.",
    odooEligible: false,
    odooReason: "Aucune preuve d'activité commerciale (pas de client, commande ou paiement mentionné nulle part dans les deux fichiers).",
    incertitude: "Le nom suggère un simple 'portefeuille de démonstrations' (drive: 'Apps-Mobiles-Prototypes'), mais registry.js ne fournit ni etat ni taches — impossible de confirmer s'il s'agit d'un prototype/démo ou d'autre chose ; laissé en 'inconnu' plutôt que de deviner à partir du seul nom.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Firmoscope / Prospeo (ex-Propecto)": {
    typeProjet: "live_vitrine",
    taigaEligible: true,
    taigaReason: "Activité de développement réelle et active, très documentée : tâches 'en cours' attribuées à codex (T-093, T-094, T-090, T-085, T-080, T-081, T-073, T-075, T-096), tâches bloquées avec responsable identifié (codex/Julien), une décision produit appliquée et consignée le jour même (P10, commit 1c6d728), et une liste de livraisons du jour avec commits horodatés (1d3b5a7, 72d5aa0, d5bbef0, 9563b7c). C'est le seul projet du lot avec un pilotage granulaire actif à suivre.",
    odooEligible: false,
    odooReason: "Aucune preuve de facturation ou de clients réels dans le registre. La grille tarifaire citée (\"Grille B2B (France 29€, Team ×2,5, Corporate sur devis)\") est listée comme tâche à construire, pas comme des paiements ou commandes confirmés ; aucun Stripe ni abonnement mentionné pour ce projet.",
    incertitude: "etat indique explicitement \"0 visiteur mesuré sur 30j\", ce qui contraste avec l'ampleur du projet décrite dans suivi (43,9M sociétés en base, déploiement continu par cron, commits quotidiens) — le trafic réel semble incertain plutôt que nul avéré. Classé live_vitrine sur la base de l'activité réelle documentée (production live, décisions appliquées), mais aucun indicateur de trafic fiable n'est fourni.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "ErpBridge AI": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches présent dans le registre — rien à suivre dans Taiga.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée (pas de client, pas de paiement).",
    incertitude: "Entrée très pauvre en données (name/url/drive uniquement). Le nom du dossier Drive ('ErpBridge AI (Connecteur v2 - MVP)') suggère un stade MVP mais rien n'est confirmé par etat/taches/note, absents de cette entrée.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Marketplace-in-a-Box — site": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches présent dans le registre — rien à suivre dans Taiga.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée (pas de client, pas de paiement).",
    incertitude: "Entrée minimale (name/url/github seulement, drive et local à null). Statut réel (live, test, gelé) non déterminable à partir du registre.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Marketplace-in-a-Box — démonstration": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches présent dans le registre — rien à suivre dans Taiga.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée (pas de client, pas de paiement).",
    incertitude: "Le nom de l'entrée contient le mot 'démonstration', ce qui suggère fortement un usage de démo plutôt qu'un site de production, mais aucun champ etat/taches/note ne le confirme explicitement — je n'ai pas voulu en déduire un typeProjet sans donnée d'état écrite.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "ProjectBridge AI": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches présent dans le registre — rien à suivre dans Taiga.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée (pas de client, pas de paiement).",
    incertitude: "Aucune URL connue (url: null) et aucun état documenté — seul le nom de dossier Drive ('ProjectBridge AI (Connecteur Supabase - MVP)') suggère un stade de prototype, non confirmé par le registre.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Connecteur Dyonysos": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches présent dans le registre — rien à suivre dans Taiga.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée (pas de client, pas de paiement).",
    incertitude: "Entrée quasi vide : seul le nom du dossier Drive est confirmé (url/github/local tous à null). Aucune donnée d'état, de trafic ou d'activité disponible.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Arbitrage+": {
    typeProjet: "test_demo",
    taigaEligible: true,
    taigaReason: "Tâches actives listées (réconcilier les deux versions déployées, retirer les données simulées, brancher Keepa/SP-API/Qogita/Eany.io, focus extension Chrome) — développement réel en cours.",
    odooEligible: false,
    odooReason: "Aucune preuve de vente/abonnement client réel : Web Analytics non actif (0 mesuré), données simulées encore en place, Stripe explicitement repoussé en dernière étape ('ordre imposé par Julien'). La souscription Keepa (49€/mois) est une dépense fournisseur, pas une activité commerciale à suivre côté Odoo.",
    incertitude: "Keepa API et accès SP-API sont réellement souscrits/demandés, donc le projet progresse vers du réel, mais rien n'indique encore une activité commerciale effective.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Analyzer+": {
    typeProjet: "live_vitrine",
    taigaEligible: true,
    taigaReason: "Tâches actives listées (câbler ap_history, passer aux vraies données Keepa/SP-API) et P0 déjà livré (auth réelle Supabase + persistance) — développement documenté et en cours.",
    odooEligible: false,
    odooReason: "Aucun paiement, abonnement ou commande mentionné dans etat/taches — seulement auth utilisateur et favoris/notes.",
    incertitude: "",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Profit+": {
    typeProjet: "live_vitrine",
    taigaEligible: true,
    taigaReason: "Tâches actives listées (brancher SP-API réelle, viser parité Sellerboard) et P0 répliqué documenté (auth réelle + watchlist par utilisateur).",
    odooEligible: false,
    odooReason: "Aucun paiement, client ou commande mentionné — 30 visiteurs/30j est du trafic, pas une preuve commerciale.",
    incertitude: "",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Base Contacts Unifiée / OSINT": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun champ etat/priorite/taches renseigné dans le registre — seule une note mentionne des projets Vercel orphelins (bc-data1/2/3) à supprimer, ce qui n'est pas une activité de développement active documentée.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale (client, commande, paiement) documentée dans le registre.",
    incertitude: "Le registre ne donne ni état, ni priorité, ni tâches pour ce projet — impossible de juger son statut réel au-delà de la note sur les résidus Vercel.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Kreo": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun etat/priorite/taches renseigné — seule une note demande de clarifier le lien avec un repo 'patreon' fourni antérieurement, ce n'est pas une activité de développement active documentée.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Note indique une confusion possible entre le repo lié et un ancien repo 'patreon' jamais autorisé — statut du projet à clarifier avec Julien.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Agoeon (remake Patreon)": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun etat/priorite/taches renseigné — seule une note indique un rapprochement à faire avec Kreo, ce n'est pas une activité de développement active documentée.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Même concept que Kreo mais build distinct selon la note — pas assez d'information pour trancher si c'est un doublon actif ou non.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "OpenArt Local Studio": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun etat/priorite/taches/note renseigné dans le registre — rien à suivre.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Registre quasi vide pour ce projet (seule l'URL est renseignée).",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Canva remake / Création graphique": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun etat/priorite/taches renseigné dans le registre.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Seules l'URL et des références de dossiers Drive sont connues, aucune donnée de statut.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "CapCut remake": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucun etat/priorite/taches renseigné, url même absente du registre.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Projet quasiment non documenté (url: null, github: null) — à peine plus qu'une référence Drive.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Adaptation de contenus (reformateur média)": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche listée — la seule information est 'Déploiement actuellement indisponible', ce qui n'est pas une preuve d'activité de développement en cours.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Note dit seulement que le déploiement est actuellement indisponible — pas assez pour trancher entre 'gelé', 'test_demo' ou un simple incident temporaire.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Pet Stone": {
    typeProjet: "live_vitrine",
    taigaEligible: true,
    taigaReason: "Bug actif urgent documenté (/shop 'No product defined') et tâches listées (corriger le bug, valider les prix, suivre la config Stripe) — priorité 'urgent', développement réel en cours.",
    odooEligible: false,
    odooReason: "Le backend produits est déjà sur l'Odoo Dyonysos connecté à cette session, mais aucune commande ou paiement client réellement abouti n'est documenté : la vente directe est explicitement décrite comme 'cassée', aucun prix n'est actuellement affiché, et le RDV Stripe du 15/08 est une 'modification' en cours, pas une preuve de transactions effectives.",
    incertitude: "Le projet utilise déjà l'Odoo interne comme backend produits et semble avoir eu un historique de vente Stripe (RDV de 'modification'), ce qui le rapproche potentiellement de l'éligibilité Odoo — à réévaluer avec Julien une fois le bug /shop corrigé et si des ventes réelles sont confirmées. Le canal jugé prioritaire est désormais Amazon, pas la vente directe pet-stone.shop.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Amazon (compte vendeur Dyonysos BE)": {
    typeProjet: "live_facturation",
    taigaEligible: false,
    taigaReason: "Aucune tâche de développement listée — c'est un canal de vente (compte vendeur marketplace) avec un suivi financier/comptable, pas un chantier logiciel actif à suivre dans Taiga.",
    odooEligible: true,
    odooReason: "Preuve concrète citée dans la note : rapport de frais & TVA Amazon réel pour Q2 2026 (11 lignes AMAZON_FEE) envoyé par email les 20-21/08/2026, plus un compte fournisseur Qogita avec ticket API ouvert — activité commerciale réelle (ventes générant des frais, TVA, fournisseur) qui a du sens à suivre dans la comptabilité Odoo Dyonysos France.",
    incertitude: "La note précise que ce rapport n'est 'pas encore branché au registre financier' — l'intégration effective dans Odoo reste à faire, même si les données sources sont réelles.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Vinted (vente en ligne)": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche ni activité de développement documentée — le projet vient d'être signalé par Julien, rien à suivre pour l'instant.",
    odooEligible: false,
    odooReason: "La note est explicite : 'aucune donnée de compte ni de frais confirmée pour l'instant' — pas de preuve de vente ou de paiement réel à ce stade.",
    incertitude: "Compte tout juste signalé le 23/08, à connecter en pilotage/financier/KPI — à réévaluer une fois des données réelles disponibles.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Frip (Vinted remake)": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche, aucun état ni suivi documenté (pas d'entrée dans registry.js au-delà de github/drive, aucune entrée dans suivi-projets.js).",
    odooEligible: false,
    odooReason: "Aucune activité commerciale (client, commande, paiement) documentée nulle part.",
    incertitude: "Fiche quasi vide dans le registre (url:null, aucun champ etat/priorite/taches/note) — statut réel totalement inconnu.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Marketplace-Sharetribe-Clone": {
    typeProjet: "test_demo",
    taigaEligible: true,
    taigaReason: "suivi-projets.js liste un vrai backlog daté (01/08/2026) avec des tâches précises encore ouvertes : backend réel (À faire), hébergement démo/site (À faire), activation encaissement Starter/Pro (À faire), choix de verticale (Demandé).",
    odooEligible: false,
    odooReason: "Pas de paiement réel : les liens Stripe (990€/2990€) sont explicitement décrits comme des 'placeholders' non activés dans suivi-projets.js, aucun client identifié.",
    incertitude: "Toutes les entrées suivi-projets.js pour ce projet datent du 01/08/2026 (plus de 3 semaines avant aujourd'hui, 24/08) — aucune preuve d'activité récente ; le registre lui-même n'a ni url ni etat pour ce projet.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "NOVA ERP WEB (clone Odoo Website & eCommerce)": {
    typeProjet: "test_demo",
    taigaEligible: true,
    taigaReason: "suivi-projets.js (sous le nom 'Nova ERP Web') documente un backlog volumineux et détaillé daté du 01/08/2026 avec de nombreuses tâches 'À faire' et 'Demandé' priorisées (scaffold MVP Docker, grille tarifaire, gestionnaire d'environnements, wizard d'installation, etc.).",
    odooEligible: false,
    odooReason: "Projet encore au stade étude de marché / business plan / prototype de landing page ; aucun client, aucune commande, aucun paiement réel mentionné.",
    incertitude: "Le registre principal n'a ni url ni etat pour ce projet (rien n'indique qu'il soit en ligne). Toutes les lignes de suivi-projets.js datent du même jour (01/08/2026), sans confirmation d'activité récente.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Automation Remake": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche, état ni note dans registry.js, et aucune entrée dans suivi-projets.js.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Fiche quasi vide (seul le champ drive est renseigné) — statut réel totalement inconnu.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Mym++ / Tinder++": {
    typeProjet: "gele",
    taigaEligible: true,
    taigaReason: "suivi-projets.js (sous 'Tinder ++') montre une activité de développement réelle et documentée : backend Node/Express + SQLite fonctionnel vérifié par tests API, statuts 'En cours' pour le backend réel et l'infrastructure de sauvegarde — cohérent avec la note du registre 'développement continue'.",
    odooEligible: false,
    odooReason: "Commercialisation explicitement gelée, aucun client ni paiement réel, url:null — rien à suivre en facturation Odoo.",
    incertitude: "Ambiguïté entre le nom de catégorie/la note du registre ('gelés pour la commercialisation uniquement — développement continue') et le detail suivi-projets.js qui montre un vrai MVP backend en cours : le projet n'est pas à l'arrêt technique, seulement non commercialisé, ce qui brouille la frontière entre 'gele' et 'test_demo'. Données suivi datées du 01/08/2026, pas de confirmation plus récente.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Projet Voyage": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche, état ni note dans registry.js, et aucune entrée dans suivi-projets.js.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Fiche quasi vide (seul le champ drive est renseigné) — statut réel totalement inconnu.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Appclose remake": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche, état ni note dans registry.js, et aucune entrée dans suivi-projets.js.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Fiche quasi vide (seul le champ drive est renseigné) — statut réel totalement inconnu.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Smart Finance Guide": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche, état ni note dans registry.js, et aucune entrée dans suivi-projets.js.",
    odooEligible: false,
    odooReason: "Aucune activité commerciale documentée.",
    incertitude: "Fiche quasi vide (seul le champ drive est renseigné) — statut réel totalement inconnu.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "Breakout — templates": {
    typeProjet: "inconnu",
    taigaEligible: false,
    taigaReason: "Aucune tâche ni état documenté ; la note dit explicitement que la nature exacte du projet n'est pas confirmée.",
    odooEligible: false,
    odooReason: "Aucune preuve de client, commande ou paiement — nature commerciale du site non identifiée.",
    incertitude: "Une url existe (déployée sur Vercel) mais l'accès direct est bloqué par robots.txt et la note précise 'nature exacte non confirmée' — impossible de dire si c'est un site vivant, un prototype ou autre chose à partir des données du registre.",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "dyonysos-pilotage-social (obsolète)": {
    typeProjet: "gele",
    taigaEligible: false,
    taigaReason: "Explicitement obsolète et à supprimer ('projet Vercel créé par erreur ... à supprimer sur confirmation') — aucune activité de développement à suivre.",
    odooEligible: false,
    odooReason: "Résidu technique sans aucune activité commerciale.",
    incertitude: "",
    taigaProjectSlug: null,
    odooCompanyId: null
  },
  "bc-data1 / bc-data2 / bc-data3 (obsolètes)": {
    typeProjet: "gele",
    taigaEligible: false,
    taigaReason: "Explicitement décrits comme des résidus à supprimer d'un déploiement obfusqué — aucune activité de développement à suivre.",
    odooEligible: false,
    odooReason: "Résidus techniques sans aucune activité commerciale.",
    incertitude: "",
    taigaProjectSlug: null,
    odooCompanyId: null
  }
};

module.exports = { PROJECT_LINKS };
