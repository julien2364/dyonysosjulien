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

## Mise à jour du 23/08/2026 — onglets sur /espace-prive

`/espace-prive` a maintenant une navigation par onglets (en plus des liens existants) :
- **Réseaux sociaux** : comptes Google utilisés (julien.daures@gmail.com pour Drive/Calendar/Search Console, juju2364@gmail.com pour GitHub/Vercel), alertes d'indexation Search Console réelles, statut de connexion LinkedIn/Facebook/Instagram/TikTok/YouTube par projet (lu depuis PROJECTS si Sheets est configuré).
- **Projets** : le registre complet (38 projets), avec GitHub/Drive/local/dernier pilotage quand connu — inclut maintenant Amazon (compte vendeur Dyonysos BE) et Vinted.
- **Finance** : dépenses réelles compilées depuis les emails de notification Qonto (carte "One", active depuis le 12/08/2026 — historique d'environ une semaine seulement, pas un mois plein). Section "à relier" pour l'analyse Amazon TVA/frais déjà faite par toi et les relevés Qonto mensuels pas encore dépouillés.
- **KPI** : nombre de projets par catégorie, projets actifs, alertes d'indexation, statut du domaine.

Nouveaux fichiers : `api/_lib/registry.js`, `api/registre-projets.js`, `api/pilotage-social/reseaux.js`, `api/finance.js`, `api/kpi.js`.

**Honnêteté sur les limites** : aucun accès Search Console API ni app OAuth LinkedIn/Facebook/TikTok n'est configuré — ces onglets affichent les infos réelles disponibles par email/Sheets et disent clairement "non configuré" plutôt que d'inventer des chiffres. Pour aller plus loin : (1) Search Console — ajouter le compte de service Google (même principe que Sheets) comme utilisateur sur la propriété dyonysos.fr ; (2) réseaux sociaux — créer des apps développeur LinkedIn/Facebook/TikTok et me fournir leurs identifiants.
