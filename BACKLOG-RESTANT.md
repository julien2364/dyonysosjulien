# BACKLOG-RESTANT — suite du lot MENTIONS-P14 (hors périmètre de ce clone `dyonysosjulien`)

## À FAIRE EN LOCAL / dans d'autres dépôts

1. **Volet Odoo (règle 1 du lot)** : créer le paramètre système `ir.config_parameter` « `dyonysos.bandeau_marque` » avec le texte exact
   `© {ANNEE_COURANTE} DYONYSOS SASU — Bexo® est une marque déposée. Tous droits réservés.` et le rendre en QWeb dans le pied de page de tous les sites Odoo (y compris ceux en développement), avec le paragraphe anti-reproduction exact sur la page de mentions légales de chaque site Odoo. Aucun module Odoo n'est présent dans ce dépôt.
2. **« Tous les sites » (décision Julien 31/10 13 h 24)** : appliquer le même bandeau exact + la même clause aux autres sites du portefeuille (ex. propecto.eu, arbitragepro.eu, analyzer-plus.eu, profit-plus.tech, tribuplace.com, cvdesignpro.com, linktrib.com, agoeon.com, quizplay, ecole-connect, courshub, omnifloo.com, pet-stone.shop, lefilindependant.com, howtofacile.com, entreprendre-autrement.dyonysos.fr, parentsolo.dyonysos.fr, aipm.dyonysos.fr, atlas.dyonysos.fr…) dans leurs dépôts respectifs, chacun avec sa source unique (constante Next.js `lib/mentions.ts`, `ir.config_parameter` Odoo, ou fichier de config pour un site statique).
3. **Recherche de mentions existantes à remplacer (règle 7)** : dans chaque dépôt de site, chercher « Bexo », « marque déposée » / « trademark » / « marca registrada » / « eingetragene Marke » / « geregistreerd merk » et le n° INPI `5111908` (y compris dans les traductions i18n) et les remplacer par le bandeau exact, traduction fidèle, dans toutes les langues. Dans ce clone : déjà fait (seul `mentions-config.js` contient « Bexo® », aucun n° INPI ne subsiste — vérifié par test).
4. **Captures Playwright avec `common.js` actif** : à refaire en local (hors bac à sable) si l'on veut des captures incluant la navigation injectée par `common.js` ; dans ce clone, les captures du dossier de sortie ont été produites avec `common.js` neutralisé à cause d'un crash du navigateur headless dans le bac à sable.
5. **Contrôle en production** après déploiement Vercel : vérifier le bandeau sur toutes les pages publiques FR + les pages traduites (`/en`, `/es`, `/nl`, `/de` et leurs `/legal`), bureau et mobile.

## Déjà fait dans ce clone (branche `vibe-cloud/MENTIONS-P14/bandeau-marque`)

- Bandeau exact, source unique `mentions-config.js`, rendu par `mentions.js` sur les 23 pages publiques du site statique (y compris `espace-partenaires.html` et `defense.html`), règle 3 (remplacement sans doublon), style 11,5 px AA, 1 ligne bureau / retour propre mobile.
- Page `/mentions-legales` avec le paragraphe exact + traductions fidèles EN/ES/NL/DE + lien dans chaque pied de page.
- Tests : 31/31 OK (`node --test tests/*.test.js`), captures bureau/mobile dans le dossier de sortie hors dépôt.
