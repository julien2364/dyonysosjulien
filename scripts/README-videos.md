# Chaîne vidéo Odoo Dyonysos

## 1. Mettre une vidéo en ligne

Le script envoie le MP4 au relais privé `automation.dyonysos.fr`. Aucun secret
n'est copié dans le dépôt. Par sécurité, YouTube reçoit d'abord la vidéo en
mode **non répertorié**. Avant l'envoi, le script vérifie que le relais cible
bien la chaîne `@dyonysosfr` ; il s'arrête sans téléverser si une autre chaîne
est autorisée.

```sh
node scripts/upload-odoo-youtube.mjs \
  --file /chemin/video.mp4 \
  --title "Titre de la démonstration" \
  --language fr \
  --site-url https://www.dyonysos.fr/blog/odoo/slug \
  --odoo-url https://apps.odoo.com/apps/modules/19.0/nom_technique
```

Après la validation humaine dans YouTube Studio, rendre la vidéo publique et
l'ajouter à la playlist FR ou EN.

## 2. Diffuser sur Dyonysos.fr

Ajouter l'identifiant public à `api/_data/odoo-youtube-videos.json`, puis :

```sh
npm run videos:sync
```

Cette commande contrôle l'existence publique de la vidéo, génère les liens du
catalogue et active l'embed sur la page produit. Une seconde exécution sans
changement ne produit aucune modification fonctionnelle.

## 3. Odoo Apps

La description YouTube contient toujours les deux portes d'entrée : page
Dyonysos.fr et fiche officielle Odoo Apps. Le lien vidéo de la fiche Odoo doit
être ajouté dans `static/description/index.html`, poussé sur la branche `19.0`,
puis le dépôt doit être rescanné depuis le tableau de bord Odoo Apps.
