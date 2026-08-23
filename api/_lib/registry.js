// Registre des projets DYONYSOS — données vérifiées (API Vercel + recherche Google Drive, 23/08/2026).
// PAS de données inventées : "github: null" = aucun dépôt lié confirmé, "drive: null" = aucun dossier
// trouvé avec un nom correspondant, "local: null" = emplacement local non confirmé.
// Compte Vercel/GitHub = julien2364 (juju2364@gmail.com) — équipe Dyonysos.
// Compte Google Drive = julien.daures@gmail.com — dossier racine 1bk91_ulOovJaf8Ec3LgdHgI7vg-e_wEO.
// "dernierPilotage" = dernier outil IA (Claude/ChatGPT) + date ayant travaillé sur le projet, quand connu.
// null partout où l'information n'a pas été vérifiée — jamais inventée.

const PROJECTS = [
  // --- Site principal ---
  { name: 'dyonysos-site (site principal + espace privé)', categorie: 'Site principal', url: 'https://www.dyonysos.fr', github: 'julien2364/dyonysosjulien', drive: null, local: '/Users/juliendaures/Documents/Codex/2026-08-12/referenced-chatgpt-conversation-this-is-an/outputs', dernierPilotage: 'Claude — 23/08/2026 (module Pilotage Social + registre + onglets)', vercelProjectId: 'prj_9GUpX7bWsEM6JFXXOKMgf6dwE4EQ', note: 'Dépôt fourni par Julien (dyonysosjulien) — push en attente d’autorisation de session.' },

  // --- Éducation, formation et recrutement ---
  { name: 'CVDesignPro', categorie: 'Éducation / formation / recrutement', url: 'https://www.cvdesignpro.com/fr', github: 'julien2364/cvdesignpro', drive: 'CVForge (+ cvdesignpro, CVDesignPro-Social-Ads)', local: '/Users/juliendaures/cvdesignpro', vercelProjectId: 'prj_sbz1BpKKEmUMe1qLASFYIFahRxKA', priorite: 'urgent', etat: 'Live — trafic le plus fort du portefeuille (660 visiteurs / 969... /30j réel, voir onglet KPI). Prévisions 7-189j envoyées le 21/08 (email, révisées) servent d’objectifs de référence.', taches: ['Implémenter pour le 24/08 les demandes de David Martin (Bridge Law Services) : stockage CV pour recruteurs, matching, diffusion multi-plateformes', 'Créer le plan Stripe Premium 12,99€/mois + 39€/an (tarifs validés 08/08)', 'Comparer les prévisions du 21/08 aux indicateurs réels sur le dashboard admin', 'Corriger le rendu mobile jugé insuffisant par Julien'] },
  { name: 'QuizPlay', categorie: 'Éducation / formation / recrutement', url: 'https://quizplay-production.up.railway.app/', github: null, drive: 'QuizPlay', local: null },
  { name: 'CoursHub', categorie: 'Éducation / formation / recrutement', url: 'https://coursehub-dusky-seven.vercel.app', github: 'julien2364/Coursehub', drive: 'CoursHub', local: null },
  { name: 'École Connect', categorie: 'Éducation / formation / recrutement', url: 'https://ecole-connect-pied.vercel.app', github: 'julien2364/ecole-connect', drive: 'École Connect (+ School connect)', local: '/Users/juliendaures/Claude/School connect', vercelProjectId: 'prj_6t8rABLHNlvQb0sUMb0gT55P50E7', priorite: 'à auditer', etat: '0 visiteur mesuré sur 30j — pas de suivi récent en mémoire, état réel à vérifier.', taches: ['Faire un état des lieux (dernier point de suivi non retrouvé)'] },

  // --- Annuaire entreprises / leads ---
  { name: 'Firmoscope / Prospeo', categorie: 'Annuaire entreprises C2B/B2B', url: 'https://prospeo-drab.vercel.app/', github: 'julien2364/annuaire', drive: 'Prospeo - Livrables (Claude), Projet 2 - Annuaire entreprises et vente de leads', local: null, vercelProjectId: 'prj_iTUKEu3BUVEGJpxm9nS0Km7vjIUs', priorite: 'normal', etat: 'Délégué à ChatGPT/Codex depuis le 17/08 — Claude assure uniquement la communication/relève horaire, plus aucun développement direct. 0 visiteur mesuré sur 30j.', taches: ['Relève horaire de ce que Codex a laissé, instructions suivantes, vérification', 'Construire le C2B en premier (gratuit, priorité posée)', 'Grille B2B (France 29€, Team ×2,5, Corporate sur devis)'], note: 'Vercel: prospeo, prospeo-prototype, prospeo-mvp, firmoscope-design, firmoscope-site — plusieurs projets Vercel pour la même famille, à consolider.',
    suivi: {
      capturedAt: '23/08/2026 · 18h20 UTC',
      stats: [ { v: '43 897 112', l: 'Sociétés' }, { v: '15 190 697', l: 'Géolocalisées' }, { v: '784 260', l: 'Marchés publics' }, { v: '14 271 679', l: 'Annonces légales' }, { v: '424', l: 'Enfants sitemap' }, { v: '96', l: 'Tâches suivies' } ],
      decision: { tag: 'Décision du jour — P10', texte: 'Pas de limitation du sitemap : élargissement, pas restriction. Les 4,24 M pages « découvertes, non indexées » remontées par Search Console (22/08) ne déclenchent pas de réduction à un sous-ensemble « meilleures fiches ». La surface doit s’étendre.', qui: 'Julien · appliquée · consignée dans DECISIONS.md (commit 1c6d728)' },
      flags: [ { tag: 'À noter — coordination', texte: 'Le commit e69dff7 (renommage Firmoscope→Propecto sur 55 articles, 15h23 UTC) vient d’un troisième agent — ni Codex, ni cette session Claude. Le modèle de coordination du projet suppose deux écrivains (Claude + Codex, CLAUDE.md §5) ; un troisième compte actif explique une partie des verrous git rencontrés. À clarifier avec Julien : qui est ce compte, et faut-il l’intégrer au journal partagé.' } ],
      enCours: [
        { owner: 'codex', id: 'T-093', titre: 'Atteindre la fiche société cible B2B et particulier en 3 à 5 jours' },
        { owner: 'codex', id: 'T-094', titre: 'Rattraper le registre finlandais, fiabiliser le snapshot norvégien' },
        { owner: 'codex', id: 'T-090', titre: 'Vue particulier C2B : gratuit / réservé / indice de confiance' },
        { owner: 'codex', id: 'T-085', titre: 'Crons H24 : enrichissement, exercices, rapprochement EI, repères' },
        { owner: 'codex', id: 'T-080', titre: 'Positionnement sectoriel — reste la RPC + le revoke côté Claude' },
        { owner: 'codex', id: 'T-081', titre: 'Importer la base nationale des aides, croiser avec le profil' },
        { owner: 'codex', id: 'T-073', titre: 'Fiche dirigeant : mandats certifiés et rapprochements séparés' },
        { owner: 'codex', id: 'T-075', titre: 'Lever le filtre « actives seulement » de l’import KBO belge' },
        { owner: 'codex', id: 'T-096', titre: 'Courriel automatique en cas de panne des imports' },
      ],
      bloque: [
        { niveau: 'crit', qui: 'attend codex', pourquoi: 'Signature SQL exacte à écrire dans journal-codex.md avant que Claude applique la DDL (décision O3). Rien à faire côté Claude tant que ce n’est pas là.', taches: [
          { id: 'T-017', titre: 'Fournir les RPC privées de recherches et autorisation pilotage' },
          { id: 'T-021', titre: 'Alimenter la carte en marchés publics localisés' },
          { id: 'T-035', titre: 'Garantir l’unicité d’une revendication SIREN' },
          { id: 'T-057', titre: 'Appliquer la DDL de l’agrégat BODACC' },
        ] },
        { niveau: 'crit', qui: 'attend julien', pourquoi: 'Décisions ou accès qu’aucun agent ne peut trancher.', taches: [
          { id: 'T-048', titre: 'Rétablir les exécutions GitHub Actions d’imports' },
          { id: '—', titre: 'SUPABASE_SERVICE_ROLE_KEY absente de Vercel Production — bloque 29 codes de liasse restants, l’import entrepreneurs individuels, le pilote finances-postes étendu' },
        ] },
        { niveau: 'muted', qui: 'reste (codex, divers)', pourquoi: '21 tâches supplémentaires — pilotes RGE/RPPS/FINESS/bio/CNOA/CNB, graphe des sociétés, BODACC en profondeur, domaines français, jauges de fiche. Détail dans _ia/taches.json.', taches: [] },
      ],
      livreAujourdhui: [
        { heure: '18h08', titre: 'Curseur documents_marches figé à 0', detail: 'depuis 170 passages (3,5 jours) — cause : PostgREST tronque toute réponse RPC à 1000 lignes, lu à tort comme fin de table. Corrigé en base + JS.', commit: '1d3b5a7' },
        { heure: '18h08', titre: 'Résidu « Firmoscope »', detail: 'sur le tag de 3 articles — donnée, pas code. Corrigé, vérifié en direct.', commit: '72d5aa0' },
        { heure: '18h16', titre: 'T-038 et T-079', detail: 'affichaient « bloqué » alors que la part Claude était livrée — suivi corrigé.', commit: 'd5bbef0' },
        { heure: '18h22', titre: 'Décision P10', detail: 'consignée dans le registre.', commit: '1c6d728' },
        { heure: 'plus tôt', titre: 'T-079', detail: 'fs_ingest_upsert étendu aux 14 colonnes rapatriées FR.', commit: '9563b7c' },
      ],
      acces: [ { k: 'Site', v: 'propecto.eu', url: 'https://www.propecto.eu' }, { k: 'Dépôt', v: 'julien2364/annuaire' }, { k: 'Base', v: 'oajrjxkuhhpfwsvnnuae' }, { k: 'Déploiement', v: 'git push · cron :25' } ],
      commentLancer: [ 'En ligne — rien à faire, chaque push sur main publie.', 'En local — cd prospeo-mvp && npm install && npm run dev, secret dans .env.local (copie dans _data/secret_ingest.sh).', 'Publier — commit signé julien2364, jamais la CLI Vercel depuis ce dépôt.' ],
      source: 'Compilé par Claude (session Propecto) à partir de _ia/taches.json, journal-claude.md, journal-codex.md, DECISIONS.md et vérifications directes (SQL, HTTP). Fiche importée dans le registre le 23/08/2026 depuis un fichier suivi.html fourni par Julien — registre Drive non mis à jour automatiquement.',
    },
  },
  { name: 'Propecto (annuaire)', categorie: 'Annuaire entreprises C2B/B2B', url: null, github: null, drive: 'Propecto, Propecto — Communication omnicanale 3 mois, Propecto — vidéos à juger', local: null, note: 'Même projet que Firmoscope/Prospeo ci-dessus (renommé) — doublon d’entrée à fusionner dans une prochaine passe.' },

  // --- Commerce et performance ---
  { name: 'Arbitrage+', categorie: 'Commerce et performance', url: 'https://arbitrage-pro-app.vercel.app', github: 'julien2364/Arbitrage', drive: 'Arbitrage-Pro', local: null, vercelProjectId: 'prj_YNDpcwcBx3TfwNUF3TFDpTF6U8YJ', priorite: 'normal', etat: 'Keepa API souscrite (Starter, 49€/mois) + accès SP-API demandé — sources réelles en cours de branchement. Web Analytics non actif (0 mesuré).', taches: ['Réconcilier arb-app vs arbitrage-pro (version déployée = build minimale, version complète non déployée)', 'Retirer les données simulées, brancher les vraies API/catalogues (Eany.io 849k lignes, Qogita 414k lignes)', 'Focus sur l’extension Chrome', 'Stripe en dernière étape (ordre imposé par Julien)'] },
  { name: 'Analyzer+', categorie: 'Commerce et performance', url: 'https://analyzer-plus-preview.vercel.app', github: 'julien2364/analyzer', drive: null, local: null, vercelProjectId: 'prj_B1jt5DLJiQ9wqKiP0UJz2V0kU4rG', priorite: 'normal', etat: 'P0 fait : auth réelle Supabase + persistance favoris/notes. 49 visiteurs / 30j.', taches: ['Câbler l’historique ap_history', 'Passer aux vraies données marché (Keepa/SP-API) au lieu de démo'] },
  { name: 'Profit+', categorie: 'Commerce et performance', url: 'https://profit-plus-preview.vercel.app', github: 'julien2364/profit', drive: null, local: null, vercelProjectId: 'prj_hTcxKWwRPCATVgMAiEDlrh2hev6Q', priorite: 'normal', etat: 'P0 répliqué : auth réelle + watchlist par utilisateur. 30 visiteurs / 30j.', taches: ['Brancher SP-API réelle', 'Viser la parité 100% Sellerboard + nouvelles features'] },
  { name: 'Base Contacts Unifiée / OSINT', categorie: 'Commerce et performance', url: 'https://base-contacts-dyonysos.vercel.app', github: 'julien2364/osint--base', drive: null, local: null, note: 'Vercel bc-data1/2/3 = orphelins à supprimer (résidus).' },

  // --- Création et médias ---
  { name: 'Kreo', categorie: 'Création et médias', url: 'https://kreo-fawn.vercel.app', github: 'julien2364/Kreo', drive: 'kreo', local: '/Users/juliendaures/kreo (non connecté à cette session)', note: 'Un repo "patreon" avait aussi été fourni précédemment (autorisation jamais accordée) — à clarifier avec le repo "Kreo" actuellement lié.' },
  { name: 'Agoeon (remake Patreon)', categorie: 'Création et médias', url: 'https://remake-patreon-082026.vercel.app', github: 'julien2364/remake-patreon-082026', drive: null, local: null, note: 'À rapprocher de Kreo — même concept, build distinct.' },
  { name: 'OpenArt Local Studio', categorie: 'Création et médias', url: 'https://openart-reconstruction-edu.vercel.app', github: null, drive: null, local: null },
  { name: 'Canva remake / Création graphique', categorie: 'Création et médias', url: 'https://canva-remake-production.up.railway.app', github: null, drive: 'Canva remake, Canva Remake, canva-remake', local: null },
  { name: 'CapCut remake', categorie: 'Création et médias', url: null, github: null, drive: 'Capcut remake, CapCut remake', local: null },
  { name: 'Adaptation de contenus (reformateur média)', categorie: 'Création et médias', url: 'https://reformateur-media-dyonysos.vercel.app', github: null, drive: null, local: null, note: 'Déploiement actuellement indisponible.' },

  // --- Digitalisation et marque blanche ---
  { name: 'ErpBridge AI', categorie: 'Digitalisation / marque blanche', url: 'https://erpbridge-landing.vercel.app', github: null, drive: 'ErpBridge AI (Connecteur v2 - MVP)', local: null },
  { name: 'Marketplace-in-a-Box — site', categorie: 'Digitalisation / marque blanche', url: 'https://marketplace-in-a-box-site.vercel.app', github: 'julien2364/marketplace-in-a-box', drive: null, local: null },
  { name: 'Marketplace-in-a-Box — démonstration', categorie: 'Digitalisation / marque blanche', url: 'https://marketplace-in-a-box-demo.vercel.app', github: 'julien2364/marketplace-in-a-box', drive: null, local: null },
  { name: 'ProjectBridge AI', categorie: 'Digitalisation / marque blanche', url: null, github: null, drive: 'ProjectBridge AI (Connecteur Supabase - MVP)', local: null },
  { name: 'Connecteur Dyonysos', categorie: 'Digitalisation / marque blanche', url: null, github: null, drive: 'Connecteur Dyonysos', local: null },

  // --- Applications mobiles / portefeuille ---
  { name: 'Portefeuille de démonstrations (apps mobiles)', categorie: 'Applications mobiles', url: 'https://apps-showcase-flax.vercel.app', github: null, drive: 'Apps-Mobiles-Prototypes', local: null },

  // --- Autres projets du portefeuille (repérés, pas encore branchés au tableau de bord) ---
  { name: 'Frip (Vinted remake)', categorie: 'Autres / portefeuille', url: null, github: 'julien2364/frip', drive: 'Vinted remake, Vinted remake — Frip’', local: null },
  { name: 'Marketplace-Sharetribe-Clone', categorie: 'Autres / portefeuille', url: null, github: null, drive: 'Marketplace-Sharetribe-Clone, Projet Marketplace Créateurs - Étude complète 2026', local: null },
  { name: 'NOVA ERP WEB (clone Odoo Website & eCommerce)', categorie: 'Autres / portefeuille', url: null, github: null, drive: 'NOVA ERP WEB, Nova ERP Web - Clone Odoo Website & eCommerce SaaS, Projet SaaS Website & eCommerce', local: null },
  { name: 'Automation Remake', categorie: 'Autres / portefeuille', url: null, github: null, drive: 'Automation', local: null },
  { name: 'Mym++ / Tinder++', categorie: 'Autres / portefeuille (gelés commercialisation)', url: null, github: null, drive: 'Mym ++, Tinder, Tinder++', local: null, note: 'Gelés pour la commercialisation uniquement — développement continue.' },
  { name: 'Projet Voyage', categorie: 'Autres / portefeuille', url: null, github: null, drive: 'Projet Voyage', local: null },
  { name: 'Appclose remake', categorie: 'Autres / portefeuille', url: null, github: null, drive: 'Appclose remake', local: null },
  { name: 'Smart Finance Guide', categorie: 'Autres / portefeuille', url: null, github: null, drive: 'Smart Finance Guide', local: null },

  // --- Marketplaces personnels (vente en ligne) ---
  { name: 'Pet Stone', categorie: 'Marketplaces personnels', url: 'https://www.pet-stone.shop', github: null, drive: null, local: null, dernierPilotage: null, priorite: 'urgent', etat: 'Bug actif : /shop affiche "No product defined" — vente directe cassée (produits Odoo probablement non publiés sur le site). Canal désormais prioritaire = Amazon.', taches: ['Corriger le bug /shop (publier les produits côté Odoo)', 'Valider les prix (14,90-24,90€ conseillés le 08/08, aucun prix affiché actuellement)', 'Suivre la config Stripe (RDV "modification stripe pet stone" du 15/08)'], note: 'Ajouté au registre le 23/08 sur demande de Julien. Backend Odoo (accès Odoo dyonysos déjà connecté à cette session).' },
  { name: 'Amazon (compte vendeur Dyonysos BE)', categorie: 'Marketplaces personnels', url: null, github: null, drive: null, local: null, dernierPilotage: null, note: 'Analyse frais & TVA Amazon (rapport Q2 2026, 11 lignes AMAZON_FEE) envoyée par email les 20-21/08/2026 — pas encore branché au registre financier ci-dessous. Compte fournisseur : Qogita (ticket API ouvert le 16-17/08).' },
  { name: 'Vinted (vente en ligne)', categorie: 'Marketplaces personnels', url: null, github: null, drive: null, local: null, dernierPilotage: null, note: 'Signalé par Julien le 23/08 — aucune donnée de compte ni de frais confirmée pour l’instant, à connecter en pilotage/financier/KPI.' },

  // --- Content Engine / Pilotage ---
  { name: 'Content Engine DYONYSOS', categorie: 'Pilotage', url: '/pilotage-social', github: null, drive: 'DYONYSOS_CONTENT_ENGINE', local: null, dernierPilotage: 'Claude — 23/08/2026', vercelProjectId: 'prj_9GUpX7bWsEM6JFXXOKMgf6dwE4EQ', priorite: 'urgent (bloque Pilotage Social)', etat: '4 scénarios Make créés mais INACTIFS ; classeur Sheets créé mais VIDE (xlsx à importer).', taches: ['Importer CONTENT_ENGINE_DYONYSOS_v2.xlsx dans le classeur Sheets', 'Revalider les sélecteurs Sheets dans Make', 'Brancher le garde-fou PR-008 avant le mode AUTO', 'Tests T1-T12 puis activation'], note: 'Make (4 scénarios) + Google Sheets — piloté depuis /pilotage-social.' },
  { name: 'Cockpit adresses projets (ancien)', categorie: 'Pilotage', url: 'https://cockpit-dyonysos.vercel.app', github: null, drive: 'Cockpit 2026 -Julien, 00 - Pilotage des projets, 00 - Cockpit', local: '/Users/juliendaures/Claude/Pilotage', note: 'Registre statique antérieur — à terme remplacé/complété par ce registre + le chantier Pilotage global (conversation dédiée).' },

  // --- Projets à identifier ---
  { name: 'Breakout — templates', categorie: 'À identifier', url: 'https://breakout-templates-originals.vercel.app', github: null, drive: null, local: null, note: 'Nature exacte non confirmée — accès direct bloqué par robots.txt.' },

  // --- Nettoyage à faire ---
  { name: 'dyonysos-pilotage-social (obsolète)', categorie: 'À nettoyer', url: null, github: null, drive: null, local: null, note: 'Projet Vercel créé par erreur le 23/08, superseded par l’intégration directe dans dyonysos-site. À supprimer sur confirmation.' },
  { name: 'bc-data1 / bc-data2 / bc-data3 (obsolètes)', categorie: 'À nettoyer', url: null, github: null, drive: null, local: null, note: 'Résidus d’un déploiement obfusqué de Base Contacts — à supprimer.' },
];

module.exports = { PROJECTS };
