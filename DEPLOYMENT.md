# Guide de Déploiement — BEM API

> Stack : **NestJS v11** · **PostgreSQL** · **Prisma ORM** · **Node.js**

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Déploiement manuel sur VPS](#2-déploiement-manuel-sur-vps)
   - [2.1 Préparation du serveur](#21-préparation-du-serveur)
   - [2.2 PostgreSQL](#22-postgresql)
   - [2.3 Node.js & PM2](#23-nodejs--pm2)
   - [2.4 Clonage & build](#24-clonage--build)
   - [2.5 Variables d'environnement](#25-variables-denvironnement)
   - [2.6 Prisma & seed](#26-prisma--seed)
   - [2.7 Lancement avec PM2](#27-lancement-avec-pm2)
   - [2.8 Nginx (reverse proxy)](#28-nginx-reverse-proxy)
   - [2.9 HTTPS avec Certbot](#29-https-avec-certbot)
3. [Déploiement avec Docker](#3-déploiement-avec-docker)
   - [3.1 Dockerfile](#31-dockerfile)
   - [3.2 docker-compose.yml](#32-docker-composeyml)
   - [3.3 .dockerignore](#33-dockerignore)
   - [3.4 Lancement](#34-lancement)
4. [Variables d'environnement (référence complète)](#4-variables-denvironnement-référence-complète)
5. [Endpoints utiles post-déploiement](#5-endpoints-utiles-post-déploiement)
6. [Maintenance](#6-maintenance)

---

## 1. Prérequis

### Côté VPS (recommandations minimales)

| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| CPU       | 1 vCPU  | 2 vCPU     |
| RAM       | 1 GB    | 2 GB       |
| Disque    | 20 GB   | 40 GB SSD  |
| OS        | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Accès requis

- Accès SSH avec droits `sudo`
- Ports ouverts : `22` (SSH), `80` (HTTP), `443` (HTTPS), `3000` (app, optionnel)

### Services tiers nécessaires

- **Cloudinary** — stockage des images (compte gratuit suffisant)
- **SMTP** — envoi d'emails (Gmail, Mailgun, etc.)
- **Google OAuth** — identifiants OAuth2 (Google Console)
- **Facebook OAuth** — identifiants OAuth (Meta for Developers)

---

## 2. Déploiement manuel sur VPS

### 2.1 Préparation du serveur

```bash
# Connexion SSH
ssh user@<IP_VPS>

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Outils essentiels
sudo apt install -y git curl unzip build-essential
```

### 2.2 PostgreSQL

```bash
# Installation
sudo apt install -y postgresql postgresql-contrib

# Démarrage et activation au boot
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Création de l'utilisateur et de la base
sudo -u postgres psql <<EOF
CREATE USER bemuser WITH PASSWORD 'VotreMotDePasseSecurise';
CREATE DATABASE bem_shop OWNER bemuser;
GRANT ALL PRIVILEGES ON DATABASE bem_shop TO bemuser;
EOF
```

> Notez les identifiants : ils serviront à construire `DATABASE_URL`.

### 2.3 Node.js & PM2

```bash
# Installation de Node.js 20 LTS via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc

nvm install 20
nvm use 20
node -v   # doit afficher v20.x.x

# Installation de PM2 (gestionnaire de processus)
npm install -g pm2

# Installation du CLI NestJS (optionnel, utile pour le debug)
npm install -g @nestjs/cli
```

### 2.4 Clonage & build

```bash
# Clonage du dépôt
cd /var/www
sudo mkdir bem-api && sudo chown $USER:$USER bem-api
git clone <URL_DU_REPO> bem-api
cd bem-api

# Installation des dépendances
npm install

# Build de production
npm run build
```

### 2.5 Variables d'environnement

```bash
# Copier l'exemple et éditer
cp .env.example .env
nano .env
```

Remplir toutes les valeurs (voir [Section 4](#4-variables-denvironnement-référence-complète)).

```bash
# Sécuriser le fichier
chmod 600 .env
```

### 2.6 Prisma & seed

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# (Optionnel) Peupler la base avec les données initiales
npm run seed
```

### 2.7 Lancement avec PM2

```bash
# Lancement de l'application
pm2 start dist/main.js --name bem-api

# Sauvegarde de la config PM2 (redémarrage automatique au reboot)
pm2 save
pm2 startup

# Vérification
pm2 status
pm2 logs bem-api
```

### 2.8 Nginx (reverse proxy)

```bash
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/bem-api
```

Contenu du fichier de configuration Nginx :

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    client_max_body_size 20M;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activation du site
sudo ln -s /etc/nginx/sites-available/bem-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2.9 HTTPS avec Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d api.votre-domaine.com

# Renouvellement automatique (déjà configuré par certbot)
sudo certbot renew --dry-run
```

---

## 3. Déploiement avec Docker

### 3.1 Dockerfile

Créer `/var/www/html/bem-api/Dockerfile` :

```dockerfile
# ─── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ─── Stage 2 : Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

### 3.2 docker-compose.yml

Créer `/var/www/html/bem-api/docker-compose.yml` :

```yaml
version: '3.9'

services:

  postgres:
    image: postgres:16-alpine
    container_name: bem_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-bemuser}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-bem_shop}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - bem_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-bemuser} -d ${POSTGRES_DB:-bem_shop}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: bem_api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-bemuser}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-bem_shop}
    ports:
      - "3000:3000"
    networks:
      - bem_network

volumes:
  postgres_data:

networks:
  bem_network:
    driver: bridge
```

### 3.3 .dockerignore

Créer `/var/www/html/bem-api/.dockerignore` :

```
node_modules
dist
.env
.env.local
.git
.gitignore
README.md
DEPLOYMENT.md
*.log
coverage
```

### 3.4 Lancement

#### Installation de Docker sur le VPS

```bash
# Désinstaller les anciennes versions
sudo apt remove -y docker docker-engine docker.io containerd runc

# Dépendances
sudo apt install -y ca-certificates curl gnupg lsb-release

# Ajout de la clé GPG officielle Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Ajout du dépôt Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installation
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Ajout de l'utilisateur courant au groupe docker (évite sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### Démarrage des conteneurs

```bash
cd /var/www/html/bem-api

# Vérifier que .env est bien renseigné
cp .env.example .env && nano .env

# Build et démarrage
docker compose up -d --build

# Vérification
docker compose ps
docker compose logs -f api

# Seed (première fois uniquement)
docker compose exec api npm run seed
```

#### Mise à jour de l'application

```bash
git pull origin main
docker compose up -d --build api
docker compose exec api npx prisma migrate deploy
```

#### Nginx devant Docker (recommandé)

Utiliser le même bloc Nginx de la [section 2.8](#28-nginx-reverse-proxy) — le conteneur `api` écoute toujours sur le port `3000` de l'hôte.

---

## 4. Variables d'environnement (référence complète)

Créer un fichier `.env` à la racine du projet en se basant sur `.env.example` :

```dotenv
# ── Application ──────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://votre-frontend.com

# ── Base de données ───────────────────────────────────────────────────────────
# (non utilisé avec Docker Compose, remplacé automatiquement)
DATABASE_URL=postgresql://bemuser:MotDePasse@127.0.0.1:5432/bem_shop

# Variables séparées pour Docker Compose
POSTGRES_USER=bemuser
POSTGRES_PASSWORD=MotDePasseTresSecurise
POSTGRES_DB=bem_shop

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=une_chaine_aleatoire_tres_longue_access
JWT_REFRESH_SECRET=une_chaine_aleatoire_tres_longue_refresh

# ── OAuth Google ──────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_CALLBACK_URL=https://api.votre-domaine.com/auth/google/callback

# ── OAuth Facebook ────────────────────────────────────────────────────────────
FACEBOOK_APP_ID=123456789
FACEBOOK_APP_SECRET=abcdef123456
FACEBOOK_CALLBACK_URL=https://api.votre-domaine.com/auth/facebook/callback

# ── Cloudinary ────────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEf_xxxx

# ── Email (SMTP) ──────────────────────────────────────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=votre.email@gmail.com
MAIL_PASS=motdepasse_application_gmail
MAIL_FROM="BEM Shop<no-reply@votre-domaine.com>"
ADMIN_EMAIL=admin@votre-domaine.com
```

> **Générer des secrets JWT sécurisés :**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 5. Endpoints utiles post-déploiement

| URL | Description |
|-----|-------------|
| `GET /` | Health check de l'application |
| `GET /api/docs` | Documentation Swagger interactive |
| `GET /auth/google` | Authentification OAuth Google |
| `GET /auth/facebook` | Authentification OAuth Facebook |

---

## 6. Maintenance

### Logs

```bash
# Avec PM2
pm2 logs bem-api --lines 100

# Avec Docker
docker compose logs -f api --tail=100
```

### Sauvegarde de la base de données

```bash
# Manuel
pg_dump -U bemuser bem_shop > backup_$(date +%Y%m%d_%H%M).sql

# Avec Docker
docker compose exec postgres pg_dump -U bemuser bem_shop > backup_$(date +%Y%m%d_%H%M).sql
```

### Restauration

```bash
psql -U bemuser bem_shop < backup_20260601_1200.sql

# Avec Docker
cat backup.sql | docker compose exec -T postgres psql -U bemuser bem_shop
```

### Redémarrage de l'application

```bash
# PM2
pm2 restart bem-api

# Docker
docker compose restart api
```

### Mise à jour des migrations Prisma

```bash
# Manuel
npx prisma migrate deploy

# Docker
docker compose exec api npx prisma migrate deploy
```


ssh sdbalde@180.149.197.127

# root ssh

ssh root@180.149.197.127

cd /home/sdbalde/apps/bem-api
npm run build
npx prisma migrate deploy
pm2 restart bem-api --update-env

# Vérifier
pm2 logs bem-api --lines 20


# Voir les logs en temps réel
pm2 logs bem-api --lines 30

Sauvegarder PM2 pour le redémarrage automatique :
pm2 save
pm2 startup
# → Copie-colle la commande sudo qui s'affiche



# Créer les templates Node.js
mkdir -p /usr/local/hestia/data/templates/web/nginx/proxy

tee /usr/local/hestia/data/templates/web/nginx/proxy/nodejs.tpl << 'EOF'
server {
    listen      %ip%:%web_port%;
    server_name %domain_idn% %alias_idn%;
    error_log   /var/log/%web_system%/domains/%domain%.error.log error;
    location / {
        proxy_pass         http://127.0.0.1:%proxy_port%;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host       $host;
        proxy_set_header   X-Real-IP  $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

tee /usr/local/hestia/data/templates/web/nginx/proxy/nodejs.stpl << 'EOF'
server {
    listen      %ip%:%web_ssl_port% ssl;
    server_name %domain_idn% %alias_idn%;
    ssl_certificate      %ssl_pem%;
    ssl_certificate_key  %ssl_key%;
    error_log   /var/log/%web_system%/domains/%domain%.error.log error;
    location / {
        proxy_pass         http://127.0.0.1:%proxy_port%;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host       $host;
        proxy_set_header   X-Real-IP  $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Donner sudo à sdbalde
echo "sdbalde ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

echo "✅ Fait !"



Contacte l'administrateur système et envoie-lui ce message :

Bonjour, j'ai besoin que vous effectuiez ces actions sur le serveur vps111252 pour mon déploiement :

Créer les fichiers de template Nginx dans /usr/local/hestia/data/templates/web/nginx/proxy/ (nodejs.tpl et nodejs.stpl)
M'ajouter aux sudoers : echo "sdbalde ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers



pm2 status          # vérifier que les apps tournent
pm2 logs            # voir les erreurs
pm2 restart all     # redémarrer si problème
pm2 save            # sauvegarder la configuration


✅ Backend NestJS    → https://api.boutique.bem.sn/api/docs
✅ Frontend Next.js  → https://boutique.bem.sn
✅ SSL Let's Encrypt → Valide sur les 2 domaines (expire sept 2026)
✅ Renouvellement    → Automatique via certbot
✅ Base de données   → PostgreSQL 15 tables
✅ PM2               → Apps online 24/7