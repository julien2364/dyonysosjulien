# Pilotage Social — intégré à dyonysos.fr/espace-prive
## Guide de lancement (corrigé le 23/08/2026)

**Important — correction d'architecture :** ce module n'est PAS un projet à part. Il complète directement le site en production **www.dyonysos.fr**, dans l'espace privé existant (`/espace-prive`). Nouvelle page : **`/pilotage-social`**, protégée par le même identifiant/mot de passe que le reste de l'espace privé.

Un premier essai avait créé un projet Vercel séparé (`dyonysos-pilotage-social`) — c'était une erreur, corrigée. Ce projet séparé, le dossier local `pilotage-social-dyonysos` et le dossier Drive "Pilotage Social (Admin)" sont **obsolètes** ; à supprimer quand tu veux (pas fait automatiquement).

## Où est le code

Le vrai code source de dyonysos.fr (celui relié au projet Vercel `dyonysos-site`, confirmé via `.vercel/project.json`) se trouve ici sur ton Mac :

```
/Users/juliendaures/Documents/Codex/2026-08-12/referenced-chatgpt-conversation-this-is-an/outputs/
```

C'est un **site statique** (HTML/CSS/JS, pas de framework) + des **fonctions serverless Vercel** dans le dossier `api/`. J'ai ajouté/modifié 13 fichiers dedans :
- `pilotage-social.html` — la page (tableau de bord, nouvelle publication, calendrier, erreurs)
- `api/pilotage-social/*.js` — les routes (projects, requests, requests/[id]/approve, queue, logs)
- `api/_lib/*.js` — logique partagée (session, Google Sheets, Make, schéma des colonnes)
- `vercel.json` — ajout de la route `/pilotage-social`
- `api/private-links.js` — ajout d'un lien "Pilotage Social" dans le tableau de bord de `/espace-prive`
- `package.json` — ajout de la dépendance `googleapis`

Une sauvegarde de la source complète (avant modification) est dans `/Users/juliendaures/Claude/Sauvegardes/dyonysos-site-src-bkp-v1.tar.gz`.

## Comment déployer (une seule commande, à lancer toi-même)

Je n'ai pas redéployé automatiquement — c'est ton site de production, le déploiement doit venir de toi.

```bash
cd "/Users/juliendaures/Documents/Codex/2026-08-12/referenced-chatgpt-conversation-this-is-an/outputs"
npm install
vercel --prod
```

Ce dossier est déjà relié au bon projet Vercel (`dyonysos-site`) — pas besoin de relier quoi que ce soit.

## Authentification — rien à créer, ça réutilise l'existant

Le module utilise **exactement le même login** que le reste de `/espace-prive` (variables déjà configurées sur Vercel : `PRIVATE_EMAIL`, `PRIVATE_PASSWORD_HASH`, `PRIVATE_PASSWORD_SALT`, `PRIVATE_SESSION_SECRET`). Pas de nouveau mot de passe à définir.

## Ce qu'il reste à configurer pour que les écritures soient réelles

Comme avant : un compte de service Google Cloud (Sheets) partagé en éditeur sur le classeur, + un jeton API Make. Sans ça, la page s'affiche mais indique "non configuré" au lieu de planter.

### 1. Compte de service Google Cloud (Google Sheets)

1. https://console.cloud.google.com/ → créer/choisir un projet.
2. API et services > Bibliothèque → activer **Google Sheets API**.
3. API et services > Identifiants → Créer des identifiants → **Compte de service**.
4. Une fois créé → onglet Clés → Ajouter une clé → JSON → télécharger.
5. Dans le fichier JSON : `client_email` et `private_key`.
6. Ouvrir le classeur (id `1jr-MmuuK28128przk2ut949AwGRFaB0UkYMATluZwJw`) → Partager → coller le `client_email` → rôle **Éditeur**.

### 2. Jeton API Make

1. https://www.make.com/ → avatar → Réglages du profil → API.
2. Ajouter un jeton, scope minimum `scenarios:read` + `scenarios:run`.
3. Noter aussi la zone (ex. `eu1.make.com`, visible dans l'URL).

### 3. Variables d'environnement sur Vercel

Projet `dyonysos-site` → Settings → Environment Variables (Production), ajouter :

| Variable | Valeur |
|---|---|
| `SPREADSHEET_ID` | `1jr-MmuuK28128przk2ut949AwGRFaB0UkYMATluZwJw` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | le `client_email` du JSON |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | le `private_key` du JSON (avec les `\n`) |
| `MAKE_API_TOKEN` | le jeton Make |
| `MAKE_ZONE` | ex. `eu1.make.com` |

Puis redéployer (`vercel --prod` à nouveau, ou Redeploy depuis le dashboard Vercel).

### 4. Importer les données (si pas déjà fait)

Le classeur doit contenir les onglets PROJECTS / CONTENT_IDEAS / CONTENT_QUEUE / PUBLICATION_LOG / MANUAL_REQUESTS — via `CONTENT_ENGINE_DYONYSOS_v2_A_IMPORTER.xlsx` (déjà livré, dans le Drive dossier `_ENGINE`), à importer par **Fichier > Importer > Remplacer la feuille de calcul**.

## Limite connue (héritée du Content Engine)

Les scénarios Make `C. ASSET` et `D. PUBLISHER` ont le dossier Drive images / URN LinkedIn / page Facebook codés en dur pour CVDesignPro au lieu de lire dynamiquement `PROJECTS!drive_folder_id_images` / `li_org_urn` / `fb_page_id`. Sélectionner un autre projet publiera quand même sur les comptes CVDesignPro tant que ce n'est pas corrigé dans Make.

## Dépôt GitHub

Tu as fourni `https://github.com/julien2364/dyonysosjulien`. Le code est commité localement côté session (2 commits, dont le dernier ajoute les onglets ci-dessous), prêt à pousser — mais le push est refusé (403 : "not in this session's authorized repository set") tant que ce dépôt n'est pas autorisé comme source de cette session Cowork. C'est un blocage technique côté proxy git de la session, pas quelque chose que je peux contourner : il faut l'autoriser depuis les réglages de la session/du repo côté Cowork pour que je pousse automatiquement.

## État réel du moteur Make — vérifié en direct via l'API Make le 23/08/2026

Sur ta demande explicite ("je veux le moteur derrière, pas le visuel et le planning"), voici l'état réel des connexions et scénarios Make (équipe 111657), interrogé en direct, pas déclaré :

**Connexions OAuth vivantes (vérifiées) :**
- **Facebook** — connectée, expire le 03/10/2026 (dans ~6 semaines — à renouveler avant cette date sinon toute publication Facebook s'arrête).
- **LinkedIn** — connectée, expire le 04/08/2027.
- **Google (Drive + Sheets + Gmail)** — connectée (julien.daures@gmail.com), pas d'expiration.
- **OpenAI** — connectée (2 connexions actives, génération de contenu IA opérationnelle).
- **Odoo** — connectée (basique).

**Connexions manquantes, alors que des scénarios les utilisent déjà :**
- **Instagram Business** — aucune connexion Make. Le scénario "Propecto Social net" a une branche Instagram prête (CreatePostPhoto) mais échouera tant qu'aucune connexion n'est ajoutée.
- **YouTube** — pareil : branche prête (uploadVideo), aucune connexion.
- **TikTok** — pas de module Make officiel utilisé ; le scénario passe par un appel HTTP direct à l'API TikTok avec un jeton attendu dans un Data Store Make ("tiktok_access_token") — jeton non confirmé rempli.

**Ce qui tourne déjà pour de vrai :**
- "Propecto Social net — injection du calendrier" (id 9673591) est **ACTIF** et a réussi sa dernière exécution le 20/08 (603 opérations) : le calendrier Propecto (récupéré depuis propecto.eu/calendrier-social.json) est déjà injecté dans un Data Store Make. Donc pour Propecto, la donnée de planification est réellement là, pas juste affichée.

**Ce qui est prêt mais encore éteint (0 exécution) :**
- "Propecto Social net" (id 9671300, le vrai publisher) et "Propecto Social net — boucle du calendrier" (id 9671308) : programmés pour démarrer le 24/08, encore **inactifs**. Les branches Facebook (page réelle 1273687475829499) et LinkedIn (organisations réelles 141183916/140833984) sont complètes et fonctionnelles. Les branches Instagram/YouTube échoueront (connexions manquantes ci-dessus).
- "Pet Stone — Social Publisher" (id 9689836) et "Arbitrage Pro Social net" (id 9671337) : connexions Facebook/LinkedIn complètes, jamais exécutés, encore inactifs.
- Les 4 scénarios "[CE] A/B/C/D" (Content Engine générique) : toutes leurs connexions (Sheets, OpenAI, Drive, LinkedIn, Facebook) sont valides et prêtes, mais ils lisent l'onglet PROJECTS du classeur `1jr-MmuuK28128przk2ut949AwGRFaB0UkYMATluZwJw` qui est vide (xlsx pas encore importé, voir section "Importer les données" ci-dessus) — ils n'ont donc rien à traiter tant que ça n'est pas fait, même une fois activés.

**Cassé :**
- "CVDesignPro — Publish social calendar" (id 9618460) est marqué **invalide** par Make (16 erreurs sur 20 exécutions) — à corriger dans Make avant de pouvoir le réactiver.

**Mise à jour — activés le 23/08/2026 sur ton accord explicite ("Oui, active les 3 prêts") :**
- "Propecto Social net" (9671300) — actif, prochaine exécution 24/08 04h00 UTC.
- "Propecto Social net — boucle du calendrier" (9671308) — actif, prochaine exécution 24/08 03h00 UTC (lundi 05h Paris). ⚠️ Non vérifié : elle lit deux clés Data Store ("semaine_courante", "semaine_max") qui doivent déjà exister avec une valeur numérique — à surveiller à sa première exécution.
- "Pet Stone — Social Publisher" (9689836) — actif, prochaine exécution 24/08 08h00 UTC. Lit un Google Sheet (id `1uNt273x4qAQA3yXi9oijSEv04SLzdGWXcKZAUj6jsaA`, colonne H = "Prêt") — vérifie qu'il contient bien du contenu marqué "Prêt" avant l'heure d'exécution, sinon rien ne partira (pas une erreur, juste rien à publier).
- "Arbitrage Pro Social net" (9671337) — actif, prochaine exécution ~24/08 01h00 UTC. **⚠️ Blocage réel repéré en l'activant :** l'appel vers `arbitragepro.eu/api/social/file` utilise un jeton d'autorisation littéralement écrit `REMPLACER_PAR_CRON_SECRET` dans Make — donc tel quel, cet appel échouera à chaque exécution (ce n'est pas branché sur un vrai secret). À corriger dans Make (remplacer ce jeton par le vrai `CRON_SECRET` du site arbitragepro.eu) avant que ce scénario ne serve à quelque chose.

Toutes les branches Instagram/YouTube/TikTok restent inactives faute de connexion (voir ci-dessus) — elles ne publieront rien, et pour Arbitrage+ elles envoient juste un rapport d'échec "sans_connexion" à l'app plutôt que de planter.

## Mise à jour du 24/08/2026 — pipes Instagram/YouTube/TikTok ajoutés (vides mais sûrs) + vérifications demandées

**Vérifié — Google Sheet Pet Stone (`1uNt273x4qAQA3yXi9oijSEv04SLzdGWXcKZAUj6jsaA`) :** contenu réel confirmé, colonne H = "Prêt" sur toutes les lignes lues (13 semaines de calendrier, réparties sur Instagram/TikTok/Facebook/LinkedIn/YouTube). Problème réel trouvé en vérifiant : le scénario Make "Pet Stone — Social Publisher" n'avait de route que pour Facebook et LinkedIn — les lignes Instagram/TikTok/YouTube (la majorité du calendrier) étaient filtrées silencieusement sans jamais être traitées ni marquées. **Corrigé** : 3 routes ajoutées (Instagram, TikTok, YouTube), qui écrivent "En attente de connexion [réseau]" en colonne H au lieu de laisser la ligne sans statut. Aucune tentative de publication réelle sur ces 3 canaux tant qu'aucune connexion Make n'existe.

**Corrigé — "Propecto Social net" :** les branches Instagram et YouTube tentaient d'appeler les modules de publication réels sans connexion configurée (risque d'erreur d'exécution si un contenu Instagram/YouTube arrivait à échéance). Reprises sur le même modèle sûr que la branche TikTok existante : vérification préalable dans le Data Store (`instagram_business_id`, `youtube_channel_id` — actuellement vides, confirmé) avant tout appel réel ; si absent, la fiche est marquée `en_attente_connexion` au lieu de planter. Le jour où tu connectes ces comptes dans Make et renseignes ces deux clés Data Store, les branches se remettront à publier pour de vrai sans autre changement de ma part.

**Vérification Facebook demandée ("FB était en échec") :** j'ai vérifié la connexion Facebook (metadata + historique réel des exécutions Make) — la connexion elle-même est valide, non expirée, aucun signal d'erreur. Mais en réalité, **aucun scénario connecté à Facebook n'a encore jamais été exécuté avec de vraies données** dans cette équipe Make (0 exécution historique sur les 5 scénarios qui utilisent Facebook) — donc je n'ai trouvé aucune trace d'un échec Facebook passé pour confirmer ou infirmer ce que tu as en tête. Le seul vrai test possible serait de laisser passer la prochaine exécution programmée (aujourd'hui) et de vérifier le résultat, ou de faire un test manuel contrôlé si tu veux que je le déclenche.

**Alerte de Julien — IDs Pet Stone non confirmés par lui :** j'ai mis en pause "Pet Stone — Social Publisher" par précaution le temps de vérifier. Vérification faite via les RPC Make (liste réelle des Pages Facebook et organisations LinkedIn accessibles par les connexions, pas une supposition) : la Page Facebook `584263104781279` est bien labellée "Pet Stone (Brussels)" et l'organisation LinkedIn `urn:li:organization:105810253` est bien labellée "Pet Stone" — les deux identifiants hardcodés dans le scénario sont corrects, confirmés en direct par Facebook/LinkedIn via Make, pas juste recopiés à l'aveugle. **Scénario laissé désactivé en attendant ta confirmation** avant réactivation, malgré cette vérification positive.

**Sur "les instantanés sont figés" :** correction actée — Stratégie/Finance/KPI construits ce soir sont des données réelles mais **non dynamiques** (pas de connexion live), pas juste "figées". Le service account Google Cloud (seul moyen de les rendre dynamiques côté site) reste en attente, sur ta demande ("pas maintenant").

## Mise à jour du 24/08/2026 — Pet Stone réactivé

Après ta confirmation ("Réactiver maintenant"), le scénario Make `9689836` "Pet Stone — Social Publisher" a été **réactivé** (`isActive: true`, `isinvalid: false` — vérifié en direct). Prochaine exécution programmée : **24/08/2026 08:00 UTC (10:00 Paris)**, planning inchangé (lun-ven 10:00). Les IDs Facebook (`584263104781279`) et LinkedIn (`urn:li:organization:105810253`) restent ceux vérifiés la veille via les RPC Make — aucune modification depuis.

## Mise à jour du 24/08/2026 — Instagram/YouTube/TikTok pour Pet Stone : les comptes existent, la connexion Make manque

Julien a confirmé que les comptes Instagram/TikTok/YouTube de Pet Stone existent réellement (le blocage n'est pas côté comptes). Vérifié dans le catalogue d'apps Make (`apps_list`) :
- **Instagram for Business** (connexion via login Facebook) et **YouTube** (connexion via compte Google) sont des connecteurs natifs Make — il suffit d'ajouter la connexion dans Make (Connexions → Ajouter), une action que Julien doit faire lui-même (authentification interactive).
- **TikTok** n'a **aucun connecteur natif de publication** dans Make (seulement "TikTok Lead Forms", pour des publicités, pas des posts) — nécessiterait une app développeur TikTok + un jeton stocké manuellement, plus lourd que les deux autres.

Dès que Julien ajoute les connexions Instagram/YouTube dans Make, les branches déjà construites (qui marquent actuellement juste "en attente de connexion") peuvent être transformées en vrais modules de publication, sur Pet Stone et sur Propecto.

**Vérifié dans Odoo (module Social Marketing, `pet-stone.shop`)** sur demande de Julien ("regarde avec Odoo si tu ne trouves pas cela") : Odoo a bien un module social natif avec des connexions réelles et des jetons OAuth actifs — mais pour la marque **Dyonysos** (Facebook page `176650678854531`, Instagram `@juliendaures`, 3 pages LinkedIn : Dyonysos, Dyonysos france, ContinueTech), pas pour Pet Stone. Aucune entrée Instagram/YouTube/TikTok pour Pet Stone trouvée là non plus, et aucune entrée YouTube/TikTok du tout, pour aucune marque.

## Mise à jour du 24/08/2026 — diagnostic "CVDesignPro — Publish social calendar" (toujours cassé, pas corrigé)

Diagnostic fait (pas de correction appliquée — voir pourquoi plus bas) :
- Les 20 dernières exécutions échouent avec la même erreur : `RuntimeError: [400] Unsupported alt type "media" for non byte stream request` sur le module `google-drive:getAFile`. C'est l'erreur que renvoie l'API Google Drive quand on demande le téléchargement direct (`alt=media`) d'un fichier qui n'a pas de contenu binaire (typiquement un Google Doc/Sheet/Slide natif) au lieu d'un export.
- Vérifié : le fichier réellement visé par la première ligne non publiée du calendrier (`w01-tue-buzzwords.png`) existe bien dans Drive, un seul résultat, `image/png` réel, 51 281 octets — donc **le contenu source n'est pas en cause**.
- Hypothèse la plus probable, à vérifier dans l'éditeur Make : le module de recherche Drive juste avant (`google-drive:searchForFilesFolders`, étape 7) est configuré en `select: "list"`, alors que le module suivant (`getAFile`, étape 8) référence `{{7.id}}` — un nom de champ qui correspond à une sortie en mode "map" (résultat unique), pas "list" (tableau). Ce décalage peut faire que `getAFile` reçoive une référence de fichier vide/invalide.
- **Je n'ai pas appliqué de correction ni relancé le scénario** : la dernière étape de ce flux est une vraie publication LinkedIn (`linkedin:CreateCompanyImagePost` sur l'organisation CVDesignPro) — tester en le relançant risquerait de publier un vrai post avant que tu aies pu vérifier le résultat. Le scénario reste désactivé.
- Recommandation : ouvrir le scénario dans l'éditeur Make, vérifier le mode de sortie du module 7 (Select : List vs Single Value/Map) et corriger la référence si besoin, en utilisant "Run once" avec la possibilité d'annuler avant l'étape LinkedIn si l'éditeur le permet. Dis-moi si tu préfères que j'applique le changement de blueprint moi-même (sans le lancer) pour que tu n'aies plus qu'à tester.

## Mise à jour du 24/08/2026 — Finance : dépenses Anthropic (Claude) et OVHcloud/IONOS ajoutées

Sur la remarque de Julien ("finance il n'y a rien sur claude code... factures ovh ionos aussi"), recherche Gmail faite et montants réels ajoutés (reçus/factures ouverts un par un, rien estimé) :
- **Anthropic (Claude)** : 3 changements de plan en moins de 3 semaines — 96,23 € le 01/08 (passage Pro→Max 5x), 125,17 € le 06/08 (Max 5x→Max 20x), 92,57 € le 19/08 (usage prépayé supplémentaire, plan Individual). Total 313,97 €.
- **IONOS** : facture 202545839795 du 26/07 — 13,31 € (Pack Domaine) + 3,03 € (Email Basic 5).
- **OVHcloud** : facture FR79732010 du 03/08 — 7,99 € (en plus de la facture FR79830343 du 16/08 déjà connue, 25,46 €).
- Note honnête : beaucoup d'autres factures OVH/IONOS existent avant juillet 2026 (renouvellements réguliers, visibles dans la boîte mail) mais n'ont pas toutes été ouvertes une par une — seuls les montants ci-dessus sont vérifiés. Le total Finance reste donc un plancher réel, pas un historique exhaustif.
- Nouveau conseil calculé automatiquement dans l'onglet Finance : les 3 changements de plan Anthropic en moins de 3 semaines valent la peine d'être surveillés (chaque changement facture en négatif le reliquat non utilisé du plan précédent).

## Mise à jour du 24/08/2026 — déploiement

Le déploiement direct depuis cette session n'est pas fiable (il faudrait transférer les 205 fichiers du site, ~9 Mo, en un seul appel — un déploiement partiel remplacerait tout le dossier côté Vercel et casserait le site). Vérifié à la place, fichier par fichier (empreintes MD5), que le dossier Mac de Julien est **identique octet pour octet** à cette session pour tous les fichiers modifiés ce soir (Stratégie, Finance, KPI, Réseaux sociaux, espace-prive.html). Julien peut donc déployer directement avec une seule commande sur son Mac :
```
cd "/Users/juliendaures/Documents/Codex/2026-08-12/referenced-chatgpt-conversation-this-is-an/outputs"
vercel --prod
```
Note technique : une tentative de commit via le pont vers l'ordinateur de Julien a laissé un fichier `.git/index.lock` bloqué (permissions refusées pour le supprimer depuis cette session) — déplacé en `.git/index.lock.bak` pour débloquer git. Si `git status` affiche encore une erreur de lock, supprimer ce fichier `.bak` est sans risque.

## Mise à jour du 23/08/2026 — onglets sur /espace-prive

`/espace-prive` a maintenant une navigation par onglets (en plus des liens existants) :
- **Réseaux sociaux** : comptes Google utilisés (julien.daures@gmail.com pour Drive/Calendar/Search Console, juju2364@gmail.com pour GitHub/Vercel), alertes d'indexation Search Console réelles, statut de connexion LinkedIn/Facebook/Instagram/TikTok/YouTube par projet (lu depuis PROJECTS si Sheets est configuré).
- **Projets** : le registre complet (38 projets), avec GitHub/Drive/local/dernier pilotage quand connu — inclut maintenant Amazon (compte vendeur Dyonysos BE) et Vinted.
- **Finance** : dépenses réelles compilées depuis les emails de notification Qonto (carte "One", active depuis le 12/08/2026 — historique d'environ une semaine seulement, pas un mois plein). Section "à relier" pour l'analyse Amazon TVA/frais déjà faite par toi et les relevés Qonto mensuels pas encore dépouillés.
- **KPI** : nombre de projets par catégorie, projets actifs, alertes d'indexation, statut du domaine.

Nouveaux fichiers : `api/_lib/registry.js`, `api/registre-projets.js`, `api/pilotage-social/reseaux.js`, `api/finance.js`, `api/kpi.js`.

**Honnêteté sur les limites** : aucun accès Search Console API ni app OAuth LinkedIn/Facebook/TikTok n'est configuré — ces onglets affichent les infos réelles disponibles par email/Sheets et disent clairement "non configuré" plutôt que d'inventer des chiffres. Pour aller plus loin : (1) Search Console — ajouter le compte de service Google (même principe que Sheets) comme utilisateur sur la propriété dyonysos.fr ; (2) réseaux sociaux — créer des apps développeur LinkedIn/Facebook/TikTok et me fournir leurs identifiants.

## Mise à jour du 24/08/2026 (soir) — retour de Julien traité en direct

Suite à un retour très concret de Julien pendant qu'il regardait le dashboard live, traité dans la foulée (4 agents de recherche web lancés en parallèle pour le concurrentiel/BMC/SWOT, le reste en direct) :

- **Doublon "Annuaire entreprises C2B/B2B" corrigé** — le registre avait bien deux entrées pour le même projet (Firmoscope/Prospeo et "Propecto (annuaire)", déjà marqué comme doublon à fusionner) : fusionné en une seule entrée dans `api/_lib/registry.js`.
- **Backlog granulaire réel importé** — Julien a signalé un fichier `Pilotage-des-projets.xlsx` dans `/Users/juliendaures/Claude/Pilotage/` (onglet "Suivi", 525 lignes réelles, tâche par tâche) pour 8 projets qui n'avaient jusque-là aucun détail dans le registre : Nova ERP Web, École Connect, CoursHub, Mym++, Marketplace-Sharetribe-Clone, QuizPlay, Vinted remake (Frip'), Tinder++. Importé tel quel dans `api/_lib/suivi-projets.js`, exposé par `api/registre-projets.js` (`suiviGranulaire`) et affiché dans l'onglet **Projets** (déroulant par projet, avec statuts Fait/À faire/Idée/Backlog...).
- **CRM (Odoo) clarifié** — Julien a dit clairement que Taiga est le vrai outil de suivi/CRM voulu, pas Odoo. Aucun accès Taiga n'a été fourni : `api/crm.js` affiche maintenant un bloc `crmReel` explicite (outil demandé = Taiga, non connecté, ce qu'il faut pour brancher) au-dessus du constat Odoo (qui reste affiché comme preuve du diagnostic, pas comme donnée utile).
- **Stratégie enrichie avec du vrai concurrentiel + BMC/SWOT** — 4 agents de recherche web (sourcée, avec URLs) ont produit : liste de concurrents réels + une source pour presque tous les projets du portefeuille (remplace les "à confirmer"), et un Business Model Canvas + SWOT complets pour les 3 projets urgents (CVDesignPro, Pet Stone, Content Engine DYONYSOS). Données dans `api/_lib/strategie-data.js`, exposées par `api/strategie.js` (`marcheParProjet`, `bmcSwot`), affichées dans l'onglet **Stratégie**.
  - **Correction factuelle importante** : la recherche web a établi que pet-stone.shop ne vend pas des pierres de lithothérapie pour animaux, mais un produit-cadeau humoristique type "pet rock" (fausse adoption d'un animal-caillou). Toute mention antérieure de "lithothérapie" pour Pet Stone dans ce dashboard était donc inexacte — corrigée partout.
- **Finance : Objectifs du mois et Prévisionnel recalculés** (demande explicite : "calcule tout ça avec le planning, ce qui est en cours, réalisé") — ce ne sont plus des placeholders "non configuré" mais un vrai rollup depuis `api/_lib/registry.js` (projets urgents, tâches en cours, ce qui a été livré ce mois) et un plancher de coûts connus (Keepa 49€/mois confirmé ; les autres fournisseurs n'ont pas encore une cadence assez régulière pour être projetés honnêtement).
- **Ébauche de finances personnelles trouvée dans Drive** (`Etat du budget mensualisé.xls`, créé le 19/08) — ouverte : c'est un modèle vierge (toutes les lignes à 0), pas des données réelles. `financesPersonnelles` reste donc "non configuré", avec le fichier référencé + 4 autres dossiers Drive non encore ouverts (mis_builder_budget, Smart Finance Guide, 01 - Personnel, 7 - Smart finance hub) si Julien veut continuer cette piste.

**Nouveaux fichiers** : `api/_lib/suivi-projets.js`, `api/_lib/strategie-data.js`. **Fichiers modifiés** : `api/_lib/registry.js`, `api/crm.js`, `api/finance.js`, `api/strategie.js`, `api/registre-projets.js`, `espace-prive.html`.

**Pas fait ce soir (à prioriser avec Julien)** : BMC/SWOT complet pour le reste du portefeuille (~11 projets restants, seuls les concurrents ont été trouvés, pas le canevas complet) ; connexion Taiga réelle (accès non fourni) ; dépouillement des relevés Qonto avril-juillet pour un vrai prévisionnel de revenu.

## Mise à jour du 24/08/2026 (soir, suite) — BMC/SWOT complété + correction Qonto

Sur "de suite" de Julien, complété immédiatement après :

- **BMC/SWOT pour les 11 projets restants** — 4 agents de recherche web supplémentaires (Arbitrage+/Analyzer+/Profit+ ; École Connect/CoursHub/QuizPlay ; Agoeon/Tinder++/Mym++ ; NOVA ERP WEB/Marketplace-Sharetribe-Clone/Frip) ont produit concurrents sourcés + marché + BMC + SWOT pour chacun. 14 des 15 projets du registre ont maintenant un BMC/SWOT complet (Firmoscope/Prospeo n'a que le concurrentiel). Données dans `api/_lib/strategie-data.js`, visibles dans l'onglet Stratégie.
- **Correction Finance** : l'hypothèse "relevés Qonto avril-juillet déjà reçus par email, juste à ouvrir" était fausse — vérifié en ouvrant les emails : ce sont des liens vers le portail Qonto (connexion requise), pas des pièces jointes. Cette session ne se connecte jamais à un compte bancaire. Corrigé dans `aRelier` et `previsionnel`.
- **Nouveau coût réel trouvé** : abonnement Qonto lui-même, forfait "Smart" 228€/an (email de bienvenue du 18/12/2025) — ajouté au plancher de coûts connus (`api/_lib/finance-data.js`, `ABONNEMENT_QONTO`).
- **Taiga / Odoo — clarification technique importante** : Julien a demandé de copier le code source de Taiga (et le "bloc community" d'Odoo) directement dans dyonysos.fr. Techniquement, Taiga et Odoo Community sont des applications complètes auto-hébergées (backend + base de données + processus en arrière-plan) — incompatibles avec l'architecture actuelle du site (statique + fonctions serverless Vercel, sans base de données ni serveur persistant). Elles ne peuvent pas être "greffées" dans ce dépôt. Chemin réaliste, équivalent à ce qui est déjà prévu pour Automation Remake (fork Activepieces auto-hébergé) : héberger une vraie instance Taiga/Odoo Community sur un serveur séparé (Docker/VPS), puis relier dyonysos.fr à cette instance par lien + éventuellement un résumé via API. Pas fait ce soir — nécessite une décision d'hébergement avec Julien.
