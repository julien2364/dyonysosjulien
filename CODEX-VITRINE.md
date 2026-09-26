# Contrôle vitrine Odoo — 27 septembre 2026

## État vérifié

- Le catalogue public contient 86 applications : 67 fiches sont signalées comme publiées sur Odoo Apps et 19 comme annoncées.
- La page catalogue, la page d’accueil et les données structurées reprennent désormais ces chiffres sans présenter les 19 annonces comme déjà disponibles sur le Store.
- Les pages article dynamiques déterminent leur appel à l’action depuis `api/odoo-apps-publiees.json` : lien Odoo Apps et disponibilité `InStock` pour une fiche vérifiée, mention d’annonce et disponibilité `PreOrder` sinon.
- La date de modification des articles dynamiques est mise à jour au 27 septembre 2026.

## Contrôles exécutés

- validation syntaxique de `api/odoo-app.js` avec Node.js ;
- rendu simulé d’une application publiée (`dyo_mrp_cockpit`) et d’une application annoncée (`dyo_amap_lite`) ;
- vérification de l’absence de bouton Store trompeur sur le second cas ;
- contrôle `git diff --check`.

## Limites et suivi

- Le fichier non suivi `robots.txt.bak-avant-kit-geo-20260921-0728` existait avant cette intervention et n’a pas été modifié ni inclus au commit.
- La publication effective d’une nouvelle application sur Odoo Apps reste distincte de son annonce dans le catalogue Dyonysos et doit être contrôlée sur le Store avant reclassement.
- Le verrou disque local est actif ; aucune installation, duplication de dépôt, compilation lourde ou génération en série n’a été lancée.
