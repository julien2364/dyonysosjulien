# T034 — Plan de migration des données dynamiques et des vidéos

Lot SUITE-P14, tâche T034. **Fichier proposé seulement** : aucune migration appliquée, aucune écriture dans Odoo, aucune base de prod touchée.
Date : 2026-11-11.

## 1. Inventaire des données dynamiques actuelles (preuves : tailles mesurées le 2026-11-11)

| Donnée | Fichier source | Taille / contenu | Modèle Odoo cible |
|---|---|---|---|
| Pages apps (86) | `api/odoo-app.js` (tableau `APPS`) | 86 fiches | `dyo.app.page` + `website.page` (voir manifeste) |
| Manifeste généré | `migration-odoo/manifeste-pages-apps.json` | 86 entrées, 71 507 o | Données d'import XML-RPC |
| Apps publiées sur le Store | `api/odoo-apps-publiees.json` | 67 slugs, vérifié le 2026-09-12 | Champ `online` / badge |
| Articles de blog | `api/_data/seo-article-bodies.json` | 1 075 606 o, 36 articles × 5 langues (fr/en/es 36, nl/de 34) | `blog.post` (website_blog) + traductions |
| Traductions articles | `api/_data/seo-article-i18n.json` | 61 092 o, 4 langues | `ir.translation` / contenu traduit |
| Vidéos YouTube | `api/_data/odoo-youtube-videos.json` | 3 vidéos, 2 playlists (fr/en) | Champ `video_youtube_id` de `dyo.app.page` |
| Fiches produits | `seo-data.js` (`window.DY_PRODUCTS`) | 12 produits | `website.page` `/solutions/<slug>` |
| Catalogue tarifaire indicatif | `api/_data/dyonysos_catalog_potential.json` | 82 lignes | Document interne, hors site public |
| Pages statiques + sitemap | `sitemap.xml` (366 URL), `vercel.json` (83 rewrites, 2 redirects) | — | `website.page` + `website.redirect` |
| Médias | `odoo-captures/`, `logos/`, `illustrations/`, `kits/` (3 médias × PDF/HTML/JPG) | — | `ir.attachment` + pages |
| Bandeau légal | `mentions-config.js` + `mentions.js` | texte unique, année auto | `ir.config_parameter` « dyonysos.bandeau_marque » (rendu QWeb), comme prévu au lot MENTIONS-P14 |

## 2. Ordre de migration proposé

1. Médias (`ir.attachment`) — prerequisite de tout le reste.
2. Pages statiques (41 chemins) + catégories blog (10 × 5 langues).
3. 86 pages apps via `migration-odoo/scripts/generer-pages-apps.py` (dry-run → XML → revue → envoi XML-RPC **après accord écrit de Julien**).
4. 36 articles × 5 langues (`blog.post`) + traductions.
5. Vidéos YouTube (champs embed, pas de ré-upload).
6. Redirections `website.redirect` (tableau de `ARBORESCENCE-CIBLE.md` §3) + sitemap Odoo.
7. Vérification de bout en bout en recette (staging Odoo, jamais la prod).

## 3. Vidéos

Les vidéos restent hébergées sur YouTube (chaîne @dyonysosfr, playlists fr/en listées dans `api/_data/odoo-youtube-videos.json`). La migration embarque l'ID YouTube dans `dyo.app.page.video_youtube_id` (bloc vidéo du gabarit). `scripts/sync-odoo-youtube.mjs` et `scripts/upload-odoo-youtube.mjs` restent des outils d'upload YouTube, inchangés. Aucun contenu vidéo n'est téléchargé ni ré-hébergé.

## 4. Hors périmètre — « À DÉCISION JULIEN »

- `/espace-prive` et les API serverless (`api/*` : login, crm, finance, kpi, pilotage-*, odoo-*, taiga-*, make-*, registre-projets) : portail interne, pas une page publique du site vitrine. Lot séparé nécessaire.
- Toute écriture dans l'instance Odoo (XML-RPC, interface admin) : interdite dans ce lot.
- Facturation / Stripe / envois d'e-mails : non concerné ici ; si un lot futur y touche, marquer « À DÉCISION JULIEN ».
