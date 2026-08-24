# Infrastructure Taiga + Odoo Community + Automation Remake — guide pas à pas
## Palier 0/1 — OVHcloud

**Changement de fournisseur (24/08) : passage de Hetzner à OVH sur ta demande.** Un point honnête à trancher avant de commander : la gamme **VPS** classique d'OVH s'arrête à **VPS-4 (8 vCores / 24 Go RAM / 200 Go NVMe, ~21-22€/mois)** — il n'existe pas de VPS OVH à 24 Go/32 Go équivalent au Hetzner CX52 au même tarif. OVH a bien des instances à 32 Go RAM, mais sur sa gamme **Public Cloud** (b3-32/c3-32/r3-32), facturées à l'heure et beaucoup plus chères (~114 à 315$/mois selon le type) — pas comparable en prix. Pour un lancement Palier 0/1, VPS-4 (24 Go) reste largement suffisant (Taiga + Odoo + Automation Remake + une bonne marge de tenants Odoo en base partagée) et upgradable plus tard depuis la console OVH. Je pars sur VPS-4 ci-dessous — dis-moi si tu préfères qu'on regarde le Public Cloud malgré le prix.

**Important à savoir avant de commencer** : je ne peux pas exécuter de commandes directement sur ce serveur — je n'ai pas d'accès à distance à une machine que tu crées toi-même (contrairement à ton Mac, connecté via le pont Cowork). Ce guide est donc à suivre toi-même, comme celui déjà fourni pour le déploiement `vercel --prod` ou pour Automation Remake. Colle-moi les messages d'erreur si tu bloques quelque part, je debug avec toi en direct.

---

## 1. Créer le serveur

1. Créer un compte sur [ovhcloud.com](https://www.ovhcloud.com/fr/vps/) si pas déjà fait.
2. Commander un **VPS-4** (8 vCores / 24 Go RAM / 200 Go NVMe SSD) :
   - Datacentre : Gravelines ou Strasbourg (France)
   - Image système : **Ubuntu 26.04 LTS** (Resolute Raccoon) — disponible chez OVH depuis quelques mois, support jusqu'en avril 2031 (2 ans de plus que la 24.04 LTS) ; sinon Ubuntu 24.04 LTS reste un choix valide si 26.04 n'apparaît pas dans ton interface de commande
   - Nom interne libre, ex. `dyonysos-infra-01`
   - Option **Snapshot backup** (à partir de 0,30 €HT/mois) : à cocher — c'est une image complète du serveur restaurable en un clic, un filet de sécurité en plus (pas un remplacement) de la sauvegarde des données Odoo/Taiga en cron détaillée section 9
3. OVH envoie par email (à ton adresse de compte) un nom d'utilisateur + un **mot de passe temporaire**, et l'adresse IP du serveur — contrairement à Hetzner, OVH ne propose pas d'ajouter une clé SSH au moment de la commande. La clé SSH se configure juste après, à l'étape 3 ci-dessous.
4. Note l'adresse IP donnée (ex. `141.xxx.xxx.xxx`).

## 2. DNS — pointer des sous-domaines vers ce serveur

Chez ton registrar du domaine dyonysos.fr (ou un sous-domaine dédié type `outils.dyonysos.fr`), ajoute des enregistrements **A** pointant vers l'IP du serveur :

```
taiga.dyonysos.fr       A   95.xxx.xxx.xxx
odoo.dyonysos.fr        A   95.xxx.xxx.xxx
automation.dyonysos.fr  A   95.xxx.xxx.xxx
```

(Ajoute-en d'autres plus tard pour les démos/tenants Sharetribe/Odoo Website — palier 2.)

## 3. Connexion + sécurisation de base

Différence importante vs Hetzner : OVH crée déjà un utilisateur non-root pour toi (indiqué dans l'email), le compte **root est désactivé par défaut**, et la connexion se fait avec le mot de passe temporaire reçu par email.

```bash
# 1) Première connexion avec le mot de passe temporaire reçu par email (remplace <user> par le nom fourni)
ssh <user>@141.xxx.xxx.xxx
# -> il te sera demandé de changer ce mot de passe temporaire, fais-le

# 2) Ajouter ta clé SSH publique pour ne plus taper de mot de passe ensuite
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "<colle ici le contenu de ta clé publique, ex. cat ~/.ssh/id_ed25519.pub sur ton Mac>" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3) Pare-feu minimal (SSH, HTTP, HTTPS uniquement)
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 4) Protection contre le brute-force SSH
sudo apt update && sudo apt install -y fail2ban
systemctl enable --now fail2ban
```

Reconnecte-toi ensuite avec `ssh julien@95.xxx.xxx.xxx` pour la suite.

## 4. Installer Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version   # doit afficher une version récente
```

## 5. Traefik — reverse proxy + HTTPS automatique

Traefik va router chaque sous-domaine vers le bon conteneur et gérer les certificats HTTPS (Let's Encrypt) automatiquement.

```bash
mkdir -p ~/infra/traefik && cd ~/infra/traefik
docker network create web
touch acme.json && chmod 600 acme.json
```

Créer `~/infra/traefik/docker-compose.yml` :

```yaml
services:
  traefik:
    image: traefik:v3.1
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.email=julien.daures@gmail.com"
      - "--certificatesresolvers.le.acme.storage=/acme.json"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./acme.json:/acme.json
    networks:
      - web
networks:
  web:
    external: true
```

```bash
docker compose up -d
```

## 6. Taiga

```bash
cd ~/infra
git clone https://github.com/taigaio/taiga-docker.git taiga
cd taiga
cp .env.example .env
```

Éditer `.env` : renseigner `TAIGA_DOMAIN=taiga.dyonysos.fr`, `TAIGA_SCHEME=https`, un `SECRET_KEY` aléatoire (`openssl rand -hex 32`), et les identifiants admin.

Éditer `docker-compose.yml` pour retirer l'exposition directe des ports 80/443 (Traefik s'en charge) et ajouter les labels Traefik sur le service `taiga-gateway` (le service front) :

```yaml
services:
  taiga-gateway:
    networks:
      - web
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.taiga.rule=Host(`taiga.dyonysos.fr`)"
      - "traefik.http.routers.taiga.entrypoints=websecure"
      - "traefik.http.routers.taiga.tls.certresolver=le"
networks:
  web:
    external: true
```

```bash
docker compose up -d
```

Ouvrir `https://taiga.dyonysos.fr` une fois les DNS propagés (peut prendre jusqu'à 1h).

## 7. Odoo Community

```bash
cd ~/infra && mkdir odoo && cd odoo
```

Créer `docker-compose.yml` :

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: <mot-de-passe-fort>
      POSTGRES_DB: postgres
    volumes:
      - odoo-db:/var/lib/postgresql/data
  odoo:
    image: odoo:17
    depends_on:
      - db
    environment:
      HOST: db
      USER: odoo
      PASSWORD: <mot-de-passe-fort>
    volumes:
      - odoo-web:/var/lib/odoo
    networks:
      - web
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.odoo.rule=Host(`odoo.dyonysos.fr`)"
      - "traefik.http.routers.odoo.entrypoints=websecure"
      - "traefik.http.routers.odoo.tls.certresolver=le"
volumes:
  odoo-db:
  odoo-web:
networks:
  web:
    external: true
```

```bash
docker compose up -d
```

Ouvrir `https://odoo.dyonysos.fr` → créer la base de données (c'est ici que le multi-tenant commence : chaque futur client = une nouvelle base créée depuis cet écran, ou via `dbfilter` pour l'automatiser plus tard).

## 8. Automation Remake (Activepieces)

Déjà documenté dans ton guide existant (`04_Guide_de_Lancement` sur Drive, dossier Automation Remake) — même principe, juste ajouter les labels Traefik pour `automation.dyonysos.fr` au service web du `docker-compose.yml` d'Activepieces, comme ci-dessus pour Odoo/Taiga.

## 9. Sauvegardes (minimum à mettre en place avant d'avoir de vraies données clients)

```bash
mkdir -p ~/backups
# Exemple simple, à programmer en cron quotidien (crontab -e) :
# 0 3 * * * docker exec <container_postgres_odoo> pg_dumpall -U odoo > ~/backups/odoo-$(date +\%F).sql
```

À compléter avec un envoi vers un stockage externe (ex. rclone vers un bucket S3/Backblaze) — je peux détailler cette étape quand le reste tourne.

## 10. Relier à dyonysos.fr

Une fois Taiga en ligne : créer un token API Taiga (Réglages → Applications) et me le communiquer (en variable d'environnement Vercel, jamais en clair dans le code) pour que `api/crm.js` bascule sur les vraies données Taiga au lieu du constat Odoo actuel. Même logique pour lier Odoo si tu veux un résumé de ce nouvel Odoo (différent de celui de pet-stone.shop) dans le dashboard.

## 11. Prochaine étape (Palier 2, pas maintenant)

Le provisioning automatique multi-tenant (un environnement par client Sharetribe/Odoo Website créé à l'inscription) est une brique de développement à part (script qui crée une base Odoo ou une "community" Sharetribe à la demande) — à faire une fois que ces deux produits existent réellement et que Palier 0 tourne stable.

## 12. Nova ERP Web — déployer le MVP existant sur ce VPS (ajouté le 24/08/2026)

**Vérifié le 24/08/2026 en ouvrant le vrai zip Drive** (`Nova_ERP_Web_2026-08-02_01h03.zip`) — deux choses distinctes à déployer, pas une seule :

1. **`index.html`** (racine du dossier) : le site vitrine / page de vente — statique, fini, présentable (pricing, comparatif concurrents, argumentaire). **C'est ce qui a le plus de sens en démo publique tout de suite.**
2. **`MVP/`** : un Odoo 17 Community + Postgres qui démarre, mais **c'est un Odoo 17 vanille sans le module propriétaire** — `Projet_Final/addons/` (nova_theme_starter, nova_core) est un squelette non fonctionnel (confirmé dans son propre README : "pas encore fonctionnel — structure de départ pour le développement"). Le déployer tel quel sur un sous-domaine public montrerait un Odoo générique, pas un produit Nova ERP Web reconnaissable — à réserver à un accès protégé (toi/dev), pas à une démo commerciale, tant que le module propriétaire n'est pas construit.

**Proposition concrète :**

- `nova.dyonysos.fr` → sert `index.html` (page vitrine statique) via un simple conteneur nginx ou Traefik + volume — public, sans mot de passe, prêt immédiatement.
- `nova-app.dyonysos.fr` → l'Odoo 17 du MVP (`docker-compose.yml` ci-dessous, adapté du tien pour tourner derrière Traefik comme Taiga/Odoo/Automation) — à protéger au minimum par l'auth basique Traefik (`traefik.http.middlewares.novaauth.basicauth.users=...`) le temps que ce soit un vrai produit, pas juste pour toi seul.

```bash
cd ~/infra && mkdir nova && cd nova
mkdir -p Projet_Final
# Copier ici le contenu réel de MVP/ et Projet_Final/ depuis le zip Drive (transfert via ton Mac,
# je n'ai pas d'accès direct au VPS pour le faire moi-même)
```

`docker-compose.yml` (adapté du vrai fichier du MVP — image et volumes identiques, ports directs retirés, labels Traefik ajoutés comme pour Odoo pet-stone) :

```yaml
services:
  db:
    image: postgres:15
    container_name: nova_erp_web_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: <mot-de-passe-fort>
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - nova_db_data:/var/lib/postgresql/data/pgdata
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U odoo"]
      interval: 5s
      retries: 10
  odoo:
    image: odoo:17.0
    container_name: nova_erp_web_odoo
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      HOST: db
      USER: odoo
      PASSWORD: <mot-de-passe-fort>
    volumes:
      - nova_odoo_data:/var/lib/odoo
      - ./addons:/mnt/extra-addons
      - ./Projet_Final/addons:/mnt/extra-addons-final
      - ./Projet_Final/oca:/mnt/extra-addons-oca
    networks:
      - web
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nova.rule=Host(`nova-app.dyonysos.fr`)"
      - "traefik.http.routers.nova.entrypoints=websecure"
      - "traefik.http.routers.nova.tls.certresolver=le"
      - "traefik.docker.network=web"
volumes:
  nova_db_data:
  nova_odoo_data:
networks:
  web:
    external: true
```

Pour `nova.dyonysos.fr` (site vitrine statique), le plus simple est un petit conteneur nginx qui sert `index.html`, avec les mêmes labels Traefik que ci-dessus (rule `Host('nova.dyonysos.fr')`) — je peux détailler ce bloc dès que tu confirmes vouloir lancer cette étape.

**Non fait par manque d'accès direct au fichier** : le contenu réel de `Projet_Final/oca/fetch_oca.sh` (clone 5 dépôts OCA : web_responsive, queue_job, mis_builder, delivery-carrier, server-auth) doit être exécuté sur le VPS lui-même après copie des fichiers, `git` étant nécessaire.
