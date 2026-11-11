# T034 — Gabarit de page par application (blocs Odoo éditables)

Lot SUITE-P14, tâche T034. Un **gabarit unique** sert aux 86 pages `/applications/<slug>` ; chaque page est une instance du gabarit remplie depuis `migration-odoo/manifeste-pages-apps.json`.
Fichier proposé seulement — aucune publication.

## 1. Principe

- Une page = un enregistrement `website.page` dont l'`arch` est construite à partir du template QWeb `migration-odoo/gabarits/page-app.xml`.
- Le contenu est découpé en **blocs standards du Website Builder** (`s_title`, `s_text_block`, `s_image`, `s_button`, `s_three_columns`, `s_call_to_action`) : chaque bloc reste éditable visuellement dans Odoo, aucun HTML figé.
- Les données de l'app (prix, licence, version, vidéo, capture) viennent du manifeste ; elles sont injectées comme valeurs de champs affichés par `t-field` si un modèle dédié est installé, sinon en dur dans les blocs (moins éditable) — la version recommandée est le modèle dédié ci-dessous.

## 2. Modèle de données proposé (à installer côté Odoo, fichier proposé)

`dyo.app.page` :

| Champ | Type | Rôle |
|---|---|---|
| `name` | Char | Nom de l'app (titre H1) |
| `slug` | Char, unique | Slug de la route `/applications/<slug>` |
| `technical_name` | Char | Nom technique du module (ex. `dyo_mrp_cockpit`) |
| `group` / `group_title` / `group_anchor` | Char | Groupe du catalogue (filtre) |
| `summary` | Text | Accroche sous le titre |
| `description_html` | Html | Corps de la fiche (markdown rendu côté Vercel aujourd'hui) |
| `price` / `currency` | Float / Char | Prix affiché |
| `version` | Char | Version du module |
| `license` | Char | Licence (OPL-1) |
| `apps_url` | Char | Lien vers la fiche Odoo Apps |
| `image` | Char | Chemin de la capture (`/odoo-captures/...`) → `ir.attachment` à la migration |
| `video_youtube_id` | Char | Vidéo de démo embarquée (si présente) |
| `online` | Boolean | Disponible sur Odoo Online ou non |

## 3. Structure de la page (blocs éditables)

1. `s_title` — H1 = `name`, sous-titre = `group_title`.
2. `s_text_block` — `summary`.
3. `s_three_columns` — prix / version / licence (champs `price`, `version`, `license`).
4. `s_image` + `s_text_block` — capture (`image`) et `description_html`.
5. `s_call_to_action` — bouton « Voir sur Odoo Apps » (`apps_url`) + bouton « Demander un échange » (`/contact?objet=<name>`).
6. `s_text_block` — vidéo YouTube embarquée (`video_youtube_id`, bloc `s_embed` si disponible sinon HTML embed éditable).

## 4. Fichiers livrés

- `migration-odoo/gabarits/page-app.xml` : template QWeb `website.page` prêt à importer.
- `migration-odoo/manifeste-pages-apps.json` : 86 entrées (une par app) prêtes à mapper sur `dyo.app.page`.
- `migration-odoo/scripts/generer-pages-apps.py` : script proposé qui lit le manifeste et produit le XML `<odoo><data>` prêt à être envoyé par XML-RPC. **Mode dry-run par défaut** : aucune connexion réseau sans `--execute`, et `--execute` reste « À DÉCISION JULIEN » (aucune écriture dans Odoo dans ce lot).
