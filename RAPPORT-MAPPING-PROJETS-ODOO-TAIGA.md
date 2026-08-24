# Mapping projets → Taiga / Odoo — pour relecture par Julien

> Ce rapport vient d'une classification automatique faite à partir du texte déjà présent dans le registre (`api/_lib/registry.js` + `suivi-projets.js`), pas d'un audit fait avec Julien — à considérer comme une proposition de tri à valider, pas un état des lieux confirmé.

Généré le 24/08/2026. Données brutes utilisées dans `api/_lib/project-links.js` (clé `PROJECT_LINKS`), exposées via l'API dans `liensOdooTaiga`.

## Tableau récapitulatif

| Projet | Type | Taiga | Odoo |
|---|---|---|---|
| dyonysos-site (site principal + espace privé) | inconnu | ✅ Oui — pilotage/dev actif documenté (23/08) | ❌ Non — pas de preuve d'activité commerciale |
| Content Engine DYONYSOS | test_demo | ✅ Oui — 4 tâches actives, priorité urgente | ❌ Non — outil interne d'automatisation, pas de client |
| Cockpit adresses projets (ancien) | inconnu | ❌ Non — aucun etat/priorite/taches, outil probablement remplacé | ❌ Non — aucune donnée commerciale |
| CVDesignPro | live_facturation | ✅ Oui — urgent, trafic réel le plus fort du portefeuille | ✅ **Oui** — plan Stripe Premium en cours de création, client identifié (David Martin) |
| QuizPlay | inconnu | ✅ Oui — MVP fonctionnel, backlog daté actif | ❌ Non — tarif encore "à affiner" selon Julien, pas de paiement réel |
| CoursHub | inconnu | ✅ Oui — backlog MVP1-4 actif et détaillé | ❌ Non — Stripe "à faire", vente qualifiée d'"achat mock" |
| École Connect | test_demo | ❌ Non — "0 visiteur mesuré", "état réel à vérifier" | ❌ Non — aucune preuve de paiement |
| Portefeuille de démonstrations (apps mobiles) | inconnu | ❌ Non — aucune donnée de suivi | ❌ Non — aucune activité commerciale |
| Firmoscope / Prospeo (ex-Propecto) | live_vitrine | ✅ Oui — pilotage granulaire très actif (tâches, commits datés) | ❌ Non — grille tarifaire encore à construire, pas de paiement réel |
| ErpBridge AI | inconnu | ❌ Non — aucun etat/taches | ❌ Non — aucune activité commerciale |
| Marketplace-in-a-Box — site | inconnu | ❌ Non — aucun etat/taches | ❌ Non — aucune activité commerciale |
| Marketplace-in-a-Box — démonstration | inconnu | ❌ Non — aucun etat/taches | ❌ Non — aucune activité commerciale |
| ProjectBridge AI | inconnu | ❌ Non — aucun etat/taches | ❌ Non — aucune activité commerciale |
| Connecteur Dyonysos | inconnu | ❌ Non — aucun etat/taches | ❌ Non — aucune activité commerciale |
| Arbitrage+ | test_demo | ✅ Oui — tâches actives (Keepa/SP-API, extension Chrome) | ❌ Non — données simulées encore en place, Stripe repoussé |
| Analyzer+ | live_vitrine | ✅ Oui — tâches actives, P0 auth réelle livré | ❌ Non — pas de paiement/abonnement mentionné |
| Profit+ | live_vitrine | ✅ Oui — tâches actives, P0 répliqué documenté | ❌ Non — pas de paiement/client mentionné |
| Base Contacts Unifiée / OSINT | inconnu | ❌ Non — aucun etat/taches (juste résidus Vercel à nettoyer) | ❌ Non — aucune activité commerciale |
| Kreo | inconnu | ❌ Non — aucune activité de dev documentée | ❌ Non — aucune activité commerciale |
| Agoeon (remake Patreon) | inconnu | ❌ Non — aucune activité de dev documentée | ❌ Non — aucune activité commerciale |
| OpenArt Local Studio | inconnu | ❌ Non — registre quasi vide | ❌ Non — aucune activité commerciale |
| Canva remake / Création graphique | inconnu | ❌ Non — aucun etat/taches | ❌ Non — aucune activité commerciale |
| CapCut remake | inconnu | ❌ Non — quasiment non documenté | ❌ Non — aucune activité commerciale |
| Adaptation de contenus (reformateur média) | inconnu | ❌ Non — "déploiement actuellement indisponible" seulement | ❌ Non — aucune activité commerciale |
| Pet Stone | live_vitrine | ✅ Oui — bug urgent /shop, tâches actives | ❌ Non — vente directe "cassée", pas de transaction aboutie |
| Amazon (compte vendeur Dyonysos BE) | live_facturation | ❌ Non — pas un chantier de dev, c'est un canal de vente | ✅ **Oui** — rapport de frais & TVA Q2 2026 réel envoyé, fournisseur Qogita actif |
| Vinted (vente en ligne) | inconnu | ❌ Non — vient d'être signalé, rien à suivre | ❌ Non — "aucune donnée de compte ni de frais confirmée" |
| Frip (Vinted remake) | inconnu | ❌ Non — fiche quasi vide | ❌ Non — aucune activité commerciale |
| Marketplace-Sharetribe-Clone | test_demo | ✅ Oui — backlog daté avec tâches ouvertes | ❌ Non — liens Stripe "placeholders" non activés |
| NOVA ERP WEB (clone Odoo Website & eCommerce) | test_demo | ✅ Oui — backlog volumineux daté | ❌ Non — encore au stade étude de marché / prototype |
| Automation Remake | inconnu | ❌ Non — aucune donnée | ❌ Non — aucune activité commerciale |
| Mym++ / Tinder++ | gele | ✅ Oui — MVP backend réel en cours (dev continue malgré gel commercial) | ❌ Non — commercialisation explicitement gelée |
| Projet Voyage | inconnu | ❌ Non — aucune donnée | ❌ Non — aucune activité commerciale |
| Appclose remake | inconnu | ❌ Non — aucune donnée | ❌ Non — aucune activité commerciale |
| Smart Finance Guide | inconnu | ❌ Non — aucune donnée | ❌ Non — aucune activité commerciale |
| Breakout — templates | inconnu | ❌ Non — nature du projet non confirmée | ❌ Non — aucune activité commerciale |
| dyonysos-pilotage-social (obsolète) | gele | ❌ Non — obsolète, à supprimer | ❌ Non — résidu technique |
| bc-data1 / bc-data2 / bc-data3 (obsolètes) | gele | ❌ Non — résidus à supprimer | ❌ Non — résidus techniques |

Le détail complet des raisons (`taigaReason`, `odooReason`) et des incertitudes est dans `api/_lib/project-links.js`, exposé via l'API dans `liensOdooTaiga`.

## Décisions à valider

### Projets marqués `odooEligible: true` (décision business à confirmer)

Ces deux projets sont proposés comme candidats à un suivi Odoo (facturation/comptabilité), mais **c'est une décision business qui doit être validée explicitement par Julien** avant toute création de société/flux Odoo :

1. **CVDesignPro** — plan Stripe Premium (12,99€/mois + 39€/an, tarifs validés le 08/08) en cours de création, client identifié (David Martin, Bridge Law Services). ⚠️ Le plan Stripe est décrit comme "à créer" — l'abonnement n'est pas encore facturé au moment de la rédaction, l'éligibilité repose sur une activité commerciale imminente/validée plutôt que déjà constatée en paiement effectif.
2. **Amazon (compte vendeur Dyonysos BE)** — rapport de frais & TVA Amazon réel pour Q2 2026 (11 lignes AMAZON_FEE) envoyé par email les 20-21/08/2026, plus un fournisseur Qogita actif. ⚠️ Ce rapport n'est "pas encore branché au registre financier" — l'intégration effective dans Odoo reste à faire.

### Cas limite à noter séparément

- **Pet Stone** — non retenu `odooEligible` car la vente directe est décrite comme "cassée" et aucun prix n'est actuellement affiché, mais le backend produits est déjà sur l'Odoo Dyonysos connecté à cette session et il semble y avoir un historique de vente Stripe (RDV de "modification" du 15/08). À réévaluer une fois le bug `/shop` corrigé et si des ventes réelles sont confirmées.

### Toutes les incertitudes remontées par l'analyse (par projet)

- **dyonysos-site** — Site en ligne et en dev actif, mais aucun champ etat/priorite/taches ne donne de trafic ou de preuve d'activité utilisateur/paiement — impossible de trancher entre vitrine et test sans inventer une donnée.
- **Cockpit adresses projets (ancien)** — La note ("registre statique antérieur", "à terme remplacé") suggère un outil en voie d'abandon, proche de "gelé", mais rien d'explicite dans le registre — laissé en "inconnu" plutôt que d'inférer.
- **CVDesignPro** — Le plan Stripe est "à créer", donc l'abonnement payant n'est pas encore confirmé actif/facturé — l'éligibilité Odoo repose sur une activité imminente/validée plutôt que déjà constatée.
- **QuizPlay** — Aucune donnée etat/priorite/note dans registry.js — impossible de dire si le site est en ligne avec du trafic réel ou encore en test.
- **CoursHub** — Aucune mesure de trafic ou de lancement réel indiquée dans registry.js — typeProjet laissé à "inconnu".
- **École Connect** — Contradiction temporelle entre suivi-projets.js (dev conséquent daté du 01/08) et registry.js (23/08, "0 visiteur mesuré", "pas de suivi récent en mémoire") — classification "test_demo" prudente plutôt que "live_vitrine".
- **Portefeuille de démonstrations (apps mobiles)** — Le nom suggère un simple portefeuille de démos, mais aucun etat/taches ne le confirme — laissé en "inconnu" plutôt que de deviner à partir du seul nom.
- **Firmoscope / Prospeo** — "0 visiteur mesuré sur 30j" contraste avec l'ampleur du projet décrite dans le suivi (43,9M sociétés en base, déploiement continu) — trafic réel incertain plutôt que nul avéré. Classé live_vitrine sur la base de l'activité de dev documentée, sans indicateur de trafic fiable.
- **ErpBridge AI** — Entrée très pauvre en données ; le nom du dossier Drive suggère un stade MVP, non confirmé.
- **Marketplace-in-a-Box — site** — Entrée minimale, statut réel non déterminable.
- **Marketplace-in-a-Box — démonstration** — Le nom suggère un usage de démo, mais aucun champ ne le confirme explicitement.
- **ProjectBridge AI** — Aucune URL connue, aucun état documenté ; seul le nom du dossier Drive suggère un prototype.
- **Connecteur Dyonysos** — Entrée quasi vide, aucune donnée d'état, de trafic ou d'activité disponible.
- **Arbitrage+** — Keepa API et accès SP-API réellement souscrits/demandés, donc le projet progresse vers du réel, mais rien n'indique encore une activité commerciale effective.
- **Base Contacts Unifiée / OSINT** — Aucun état/priorité/tâches — impossible de juger le statut réel au-delà de la note sur les résidus Vercel.
- **Kreo** — Note indique une confusion possible avec un ancien repo "patreon" jamais autorisé — statut à clarifier avec Julien.
- **Agoeon (remake Patreon)** — Même concept que Kreo mais build distinct selon la note — pas assez d'information pour trancher si c'est un doublon actif.
- **OpenArt Local Studio** — Registre quasi vide (seule l'URL est renseignée).
- **Canva remake / Création graphique** — Seules l'URL et des références Drive sont connues, aucune donnée de statut.
- **CapCut remake** — Projet quasiment non documenté (url et github absents).
- **Adaptation de contenus (reformateur média)** — Note dit seulement que le déploiement est indisponible — pas assez pour trancher entre "gelé", "test_demo" ou incident temporaire.
- **Pet Stone** — Utilise déjà l'Odoo interne comme backend produits et semble avoir un historique de vente Stripe (RDV de "modification"), ce qui le rapproche potentiellement de l'éligibilité Odoo — à réévaluer avec Julien une fois le bug /shop corrigé et si des ventes réelles sont confirmées.
- **Amazon (compte vendeur Dyonysos BE)** — Le rapport de frais/TVA n'est "pas encore branché au registre financier" — l'intégration effective dans Odoo reste à faire malgré des données sources réelles.
- **Vinted (vente en ligne)** — Compte tout juste signalé le 23/08, à connecter en pilotage/financier/KPI — à réévaluer une fois des données réelles disponibles.
- **Frip (Vinted remake)** — Fiche quasi vide (url:null, aucun champ etat/priorite/taches/note) — statut réel totalement inconnu.
- **Marketplace-Sharetribe-Clone** — Toutes les entrées suivi-projets.js datent du 01/08/2026 (plus de 3 semaines avant aujourd'hui) — aucune preuve d'activité récente ; le registre principal n'a ni url ni etat pour ce projet.
- **NOVA ERP WEB** — Le registre principal n'a ni url ni etat pour ce projet ; toutes les lignes de suivi-projets.js datent du même jour (01/08/2026), sans confirmation d'activité récente.
- **Automation Remake** — Fiche quasi vide (seul le champ drive est renseigné) — statut réel totalement inconnu.
- **Mym++ / Tinder++** — Ambiguïté entre la note du registre ("gelés pour la commercialisation uniquement — développement continue") et le détail suivi-projets.js qui montre un vrai MVP backend en cours : le projet n'est pas à l'arrêt technique, seulement non commercialisé, ce qui brouille la frontière entre "gele" et "test_demo". Données datées du 01/08/2026, pas de confirmation plus récente.
- **Projet Voyage** — Fiche quasi vide — statut réel totalement inconnu.
- **Appclose remake** — Fiche quasi vide — statut réel totalement inconnu.
- **Smart Finance Guide** — Fiche quasi vide — statut réel totalement inconnu.
- **Breakout — templates** — Une url existe (Vercel) mais l'accès direct est bloqué par robots.txt et la note précise que la nature exacte du projet n'est pas confirmée — impossible de dire si c'est un site vivant, un prototype ou autre chose.

## Prochaines étapes suggérées

1. Julien relit et corrige/confirme `api/_lib/project-links.js` (en particulier les 2 `odooEligible: true` et tous les `typeProjet: inconnu`).
2. Une fois les vrais projets Taiga créés, renseigner `taigaProjectSlug` pour chaque entrée `taigaEligible: true`.
3. Une fois la société/le partenaire Odoo identifié pour chaque flux commercial validé, renseigner `odooCompanyId`.
