cd /home/sdbalde/apps/bem-api/bem_shop_api

# Récupérer les changements
git pull origin main

# Installer les nouvelles dépendances si besoin
npm install

# Recompiler
npm run build

# Si tu as modifié le schema Prisma
npx prisma migrate deploy

# Redémarrer
pm2 restart bem-api --update-env

# Vérifier
pm2 logs bem-api --lines 20


Script automatique — une seule commande
Crée ce script une fois :

cat > /home/sdbalde/deploy.sh << 'EOF'
#!/bin/bash
set -e
echo "=== Déploiement BEM $(date '+%d/%m/%Y %H:%M') ==="

echo ">> Backend..."
cd /home/sdbalde/apps/bem-api/bem_shop_api
git pull origin main
npm install
npm run build
npx prisma migrate deploy
pm2 restart bem-api --update-env

echo ">> Frontend..."
cd /home/sdbalde/apps/bem-web/bem_shop_frontend
git pull origin main
npm install
npm run build
pm2 restart bem-web --update-env

echo "=== Terminé ✅ ==="
pm2 status
EOF

chmod +x /home/sdbalde/deploy.sh


Ensuite pour chaque mise à jour :

bash /home/sdbalde/deploy.sh


Si tu modifies un fichier directement sur le serveur


# Après modification manuelle d'un fichier frontend
cd /home/sdbalde/apps/bem-web/bem_shop_frontend
npm run build && pm2 restart bem-web

# Après modification manuelle d'un fichier backend
cd /home/sdbalde/apps/bem-api/bem_shop_api
npm run build && pm2 restart bem-api




# Vérifier
pm2 logs bem-web --lines 20