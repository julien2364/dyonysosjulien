#!/usr/bin/env bash
# Nova ERP Web — déploiement en une seule commande sur le VPS OVH (Traefik déjà en place).
# Pré-requis : le zip "Nova_ERP_Web_2026-08-02_01h03.zip" doit déjà être dans ~/infra/ sur le VPS
# (transféré depuis ton Mac avec, par exemple :
#   scp ~/Downloads/Nova_ERP_Web_2026-08-02_01h03.zip ubuntu@<IP-VPS>:~/infra/
# — adapte le chemin/nom si tu l'as téléchargé ailleurs ou renommé).
#
# Usage sur le VPS : bash deploy-nova.sh   (te demandera un mot de passe pour protéger nova-app)
set -euo pipefail

ZIP="$HOME/infra/Nova_ERP_Web_2026-08-02_01h03.zip"
if [ ! -f "$ZIP" ]; then
  echo "Zip introuvable : $ZIP — transfère-le d'abord avec scp (voir commentaire en haut de ce fichier)."
  exit 1
fi

mkdir -p ~/infra/nova && cd ~/infra/nova

# 1) Extraire uniquement ce qui est nécessaire (pas les docs business, pas les anciens backups)
rm -rf /tmp/nova-src
unzip -o -q "$ZIP" -d /tmp/nova-src
SRC=$(find /tmp/nova-src -maxdepth 4 -type d -name "MVP" -exec dirname {} \;)
cp "$SRC/index.html" .
rm -rf ./MVP ./Projet_Final
cp -r "$SRC/MVP" ./MVP
cp -r "$SRC/Projet_Final" ./Projet_Final
rm -rf /tmp/nova-src

# 2) Récupérer les modules OCA nécessaires au module propriétaire (nécessite git)
if [ -f "./Projet_Final/oca/fetch_oca.sh" ]; then
  (cd ./Projet_Final/oca && bash fetch_oca.sh) || echo "fetch_oca.sh a échoué — à relancer manuellement si besoin."
fi

# 3) Mot de passe pour protéger nova-app.dyonysos.fr (MVP Odoo = pas encore un vrai produit fini)
read -r -s -p "Choisis un mot de passe pour protéger nova-app.dyonysos.fr (compte 'admin') : " NOVA_PASSWORD
echo
HASH=$(docker run --rm httpd:2.4-alpine htpasswd -Bbn admin "$NOVA_PASSWORD")
HASH_ESCAPED=$(printf '%s' "$HASH" | sed -e 's/\$/\$\$/g')
DB_PASSWORD=$(openssl rand -hex 16)

# 4) docker-compose.yml — vitrine statique (index.html) + MVP Odoo, tous deux derrière Traefik
cat > docker-compose.yml <<'EOF'
services:
  vitrine:
    image: nginx:alpine
    container_name: nova_vitrine
    restart: unless-stopped
    volumes:
      - ./index.html:/usr/share/nginx/html/index.html:ro
    networks:
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nova-vitrine.rule=Host(`nova.dyonysos.fr`)"
      - "traefik.http.routers.nova-vitrine.entrypoints=websecure"
      - "traefik.http.routers.nova-vitrine.tls.certresolver=le"
      - "traefik.docker.network=web"

  db:
    image: postgres:15
    container_name: nova_erp_web_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: __DBPASS__
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
      PASSWORD: __DBPASS__
    volumes:
      - nova_odoo_data:/var/lib/odoo
      - ./MVP/addons:/mnt/extra-addons
      - ./Projet_Final/addons:/mnt/extra-addons-final
      - ./Projet_Final/oca:/mnt/extra-addons-oca
    networks:
      - web
      - default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nova-app.rule=Host(`nova-app.dyonysos.fr`)"
      - "traefik.http.routers.nova-app.entrypoints=websecure"
      - "traefik.http.routers.nova-app.tls.certresolver=le"
      - "traefik.docker.network=web"
      - "traefik.http.routers.nova-app.middlewares=nova-auth"
      - "traefik.http.middlewares.nova-auth.basicauth.users=admin:__HASH__"

volumes:
  nova_db_data:
  nova_odoo_data:

networks:
  web:
    external: true
EOF

sed -i "s#__HASH__#$HASH_ESCAPED#g" docker-compose.yml
sed -i "s#__DBPASS__#$DB_PASSWORD#g" docker-compose.yml

docker compose up -d

echo
echo "OK :"
echo "  - Vitrine (publique) : https://nova.dyonysos.fr"
echo "  - MVP Odoo (protégé, compte admin) : https://nova-app.dyonysos.fr"
echo "  - Mot de passe Postgres généré (à garder si besoin de debug) : $DB_PASSWORD"
