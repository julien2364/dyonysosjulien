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

Tu as fourni `https://github.com/julien2364/dyonysosjulien`. Le code est déjà commité localement côté session, prêt à pousser — mais le push est refusé (403) tant que ce dépôt n'est pas autorisé comme source de cette session Cowork. Autorise-le pour que je pousse et qu'on puisse brancher l'auto-déploiement GitHub→Vercel.
