# T034 — Migration dyonysos.fr vers un site Odoo : arborescence cible

Lot SUITE-P14, tâche T034 (03_BACKLOG). Livrable « arborescence cible » — fichier proposé seulement, **aucune publication, aucune écriture dans Odoo**.
Date : 2026-11-11. Branche : `suite/SUITE-P14-migration-odoo-20261111`.

## 1. Sources analysées (preuves)

| Élément | Valeur constatée | Source dans le dépôt |
|---|---|---|
| Fiches applications | 86 apps (slugs uniques) | `api/odoo-app.js` (tableau `APPS`) |
| Manifeste des pages apps | 86 entrées générées | `migration-odoo/manifeste-pages-apps.json` |
| Articles de blog | 36 articles × 5 langues (fr/en/es 36, nl/de 34) | `api/_data/seo-article-bodies.json` |
| Pages de catégorie blog | 10 catégories × 5 langues | `api/_lib/prerender.js` (`CATEGORIES`) |
| Pages statiques | racine + 40 chemins (incl. 12 fiches `/solutions/<produit>`) | `sitemap.xml` (366 URL au total) |
| Routes dynamiques (rewrites Vercel) | 83 | `vercel.json` |
| Redirections | 2 (www → apex) | `vercel.json` |
| Vidéos YouTube associées aux apps | 3 vidéos, 2 playlists (fr/en) | `api/_data/odoo-youtube-videos.json` |
| Kits partenaires/médias | 3 médias (propecto, omnifloo, entreprendre-autrement) | `kits/` |

## 2. Arborescence cible du site Odoo (website)

Convention : la langue par défaut (fr) reste à la racine ; en/es/nl/de gardent le préfixe `/en/`, `/es/`, `/nl/`, `/de/` (Odoo gère les langues par préfixe de route avec `website` multilingue).

```
/                          → page d'accueil (website.page, blocs éditables)
/solutions                 → liste des 12 produits du portefeuille
/solutions/<produit>       → 12 fiches produit (cvdesignpro, quizplay, courshub, ecole-connect,
                             firmoscope, arbitrage-plus, analyzer-plus, profit-plus, erpbridge,
                             marketplace, creation-graphique, applications-mobiles)
/applications              → catalogue des 86 apps Odoo (page liste, filtres par groupe)
/applications/<slug>       → 86 pages app, rendues par le gabarit unique
                             `migration-odoo/gabarits/page-app.xml` (blocs éditables)
/blog                      → liste des 36 articles
/blog/<article>            → 36 articles (blog.post Odoo)
/<lang>/blog/<article>     → mêmes articles en en/es/nl/de (traductions Odoo)
/<cat>                     → 10 catégories (emploi-carriere, education, commerce, gestion,
                             marketplaces, video, graphisme, annuaire, createurs, applications)
/<lang>/<cat>              → mêmes catégories localisées
/partenaires, /espace-partenaires, /realisations, /formation-conseil, /emploi,
/contact, /mentions-legales, /outils-numeriques-etsy, /odoo-mcp-ia,
/odoo-mrp-essentiel, /odoo-connecteurs-ecommerce, /halloween-2026,
/marketplaces, /graphisme, /gestion, /annuaire, /video, /createurs
                           → pages statiques (website.page), contenus repris tels quels
/<lang>/<page-statique>    → versions localisées existantes
```

Total de pages à créer : **86 pages app + 36 articles × 5 langues + 10 catégories × 5 langues + ~41 pages statiques × langues servies ≈ 450 pages**, soit plus des « 260+ pages apps » du périmètre T034 (86 fiches app + leurs contenus associés : capture, vidéo, fiche détaillée).

## 3. Redirections à poser côté Odoo (website_redirect) — sans toucher au DNS

| Ancienne route (Vercel) | Nouvelle route (Odoo) | Source |
|---|---|---|
| `/odoo` | `/applications` | `vercel.json` rewrites |
| `/applications-odoo` | `/applications` | `vercel.json` |
| `/blog/odoo/<slug>` | `/applications/<slug>` | `vercel.json` (`/blog/odoo/:slug` → `api/odoo-app`) |
| `/blog/articles` | `/blog` | `vercel.json` |
| `/blog/applications-mobiles` | `/applications` | `vercel.json` |
| `/out/<solution>` | `/solutions/<solution>` | `vercel.json` |
| `www.dyonysos.fr/*` | `dyonysos.fr/*` | `vercel.json` redirects (déjà en place au niveau DNS) |

## 4. Hors périmètre de la migration vitrine (à noter, « À DÉCISION JULIEN »)

- `/espace-prive` et les endpoints `api/*` (login, crm, finance, kpi, pilotage-*, odoo-*, taiga-*, make-*) : back-office serverless Vercel + intégrations (Taiga, Make, Odoo interne, Sheets). Non migrables tels quels vers le website Odoo ; à traiter dans un lot portail client séparé.
- Aucune écriture dans Odoo, aucun changement de DNS, aucune publication : ce fichier est une proposition.
