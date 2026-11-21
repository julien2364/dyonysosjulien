# VIBE-COMPTE-RENDU — LOT MENTIONS-P14 (bandeau marque + clause anti-reproduction)

- Branche : `vibe-cloud/MENTIONS-P14/bandeau-marque`, créée depuis `origin/main` à jour (`51afc18`).
- Dépôt : site statique de dyonysos.fr (Vercel). Aucun module Odoo dans ce dépôt (voir SUITE).
- Aucun accès serveur/base demandé ; rien de « À FAIRE EN LOCAL » pour ce dépôt.

## RÉSULTAT

Le lot était déjà posé sur `main` (commit `436a738`) ; cette branche le complète et le vérifie de bout en bout :

1. **Source unique du bandeau** (règle 1, site statique = « fichier de configuration ») : `mentions-config.js` définit une seule fois
   `« © {ANNEE_COURANTE} DYONYSOS SASU — Bexo® est une marque déposée. Tous droits réservés. »` ; `{ANNEE_COURANTE}` est remplacée au rendu par `mentions.js` (`new Date().getFullYear()` → 2026 aujourd'hui).
2. **Bandeau en pied de page sur toutes les pages publiques** : `mentions.js` rend le bandeau dans le `<footer>` de chaque page publique le chargeant (23 pages, liste dans le test). Règle 3 : les anciennes lignes « © … Dyonysos / SASU » du pied de page sont supprimées avant insertion (pas de doublon).
3. **Écart comblé dans cette branche** : `espace-partenaires.html` (page publique, liée depuis `/partenaires`, pied de page « © 2026 Dyonysos — SASU enregistrée à Mouguerre… ») charge désormais `/mentions-config.js` + `/mentions.js` → sa ligne SASU est remplacée par le bandeau exact.
4. **Test complété** : `tests/mentions-bandeau.test.js` couvre désormais 23 pages (`defense.html` et `espace-partenaires.html` ajoutés à la liste).
5. **Mentions légales** : paragraphe exact ajouté à `mentions-legales.html` (page `/mentions-legales`, liée dans chaque pied de page) ; traductions fidèles EN/ES/NL/DE servies par `localized-secondary.html` via `/api/prerender` (`/en/legal`, `/es/legal`, `/nl/legal`, `/de/legal`).
6. **Règles 1, 2, 7** : aucun numéro INPI (ex. 5111908) ni année de dépôt nulle part dans le dépôt ; « Bexo® » / « marque déposée » n'apparaissent que dans `mentions-config.js` (hors tests) ; le bandeau ne mentionne aucun nom de produit (règle 2 respectée).
7. **Style (règle 4)** : 11,5 px, couleur `#d7e2ee` sur fond sombre (contraste AA), une ligne sur bureau, retour à la ligne propre sur mobile, aucun débordement horizontal (vérifié en navigateur réel).

## VALIDATION

- Tests : `node --test tests/*.test.js` → **31 tests, 31 pass, 0 fail** (dont `tests/mentions-bandeau.test.js` : texte exact du bandeau et du paragraphe, style 11–12 px + `overflow-wrap`, 23 pages publiques avec bandeau exact + lien `/mentions-legales` + ancienne ligne © supprimée, paragraphe traduit en EN/ES via le pré-rendu, dépôt sans aucun n° INPI et « Bexo » uniquement dans la configuration).
- Captures Playwright (Chromium headless, serveur statique sur `127.0.0.1` uniquement), dossier de sortie **hors dépôt** : `/workspace/sortie-mentions-p14/`
  - `accueil-bureau.png`, `accueil-mobile.png`, `mentions-legales-bureau.png`, `mentions-legales-mobile.png`, `espace-partenaires-bureau.png`, `espace-partenaires-mobile.png` (bureau 1440×900, mobile 390×844) + `resultats.json`.
  - Résultat navigateur réel : **6/6 OK** — 1 bandeau par page, texte exact rendu `« © 2026 DYONYSOS SASU — Bexo® est une marque déposée. Tous droits réservés. »`, `font-size: 11.5px`, `overflowX=false`, lien pied de page `href="/mentions-legales"` présent, hauteur 17 px (1 ligne) en bureau / 35 px (retour propre) en mobile.

## ÉTAT EXACT

- Fichiers modifiés sur la branche : `espace-partenaires.html` (ajout des 2 balises `<script>`), `tests/mentions-bandeau.test.js` (liste PAGES portée à 23 pages), plus ce compte rendu et `BACKLOG-RESTANT.md`.
- 1 commit propre sur la branche ; push effectué uniquement sur `vibe-cloud/MENTIONS-P14/bandeau-marque`.
- Aucune pull request ouverte, aucune fusion, aucun déploiement (conformément à la consigne de session).

## LIMITES

- Dans ce bac à sable, le navigateur headless plante au chargement de `common.js` (artefact d'environnement, hors sujet du lot) : `common.js` a été neutralisé **uniquement pour les captures** ; l'intégration complète reste couverte par les tests jsdom (31/31). Les captures montrent donc le pied de page statique + bandeau, sans la barre de navigation injectée par `common.js`.
- Les captures servent les fichiers `.html` directement en local ; les routes Vercel (`/en`, `/es/legal`… via `/api/prerender`) ne tournent pas en local — elles sont vérifiées par les tests de pré-rendu.
- Le conteneur ne contenait ni navigateur, ni polices, ni bibliothèques système : tout a été installé **hors dépôt** (`/workspace/sortie-tools/`), aucune dépendance ajoutée au `package.json` du dépôt.

## SUITE

- Volet **Odoo** du lot (règle 1 : paramètre système `ir.config_parameter` « dyonysos.bandeau_marque » rendu en QWeb) : **À FAIRE dans le dépôt des modules Odoo** — aucun module Odoo (`__manifest__.py`, `ir.config_parameter`) n'existe dans ce dépôt.
- Décision Julien « sur TOUS les sites, y compris en développement » : les autres sites (propecto.eu, etc.) vivent dans d'autres dépôts → inventaire dans `BACKLOG-RESTANT.md`.
- Après déploiement Vercel (hors périmètre ici) : contrôle visuel en production du bandeau sur toutes les pages publiques.
