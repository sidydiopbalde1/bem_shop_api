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

echo "✅ Templates créés !"





Résumé complet des étapes
1. ssh root@180.149.197.127          ← connexion root
2. Coller les commandes templates     ← créer nodejs.tpl
3. Hestia → api.boutique.bem.sn      ← proxy 3001 + SSL
4. Hestia → boutique.bem.sn          ← proxy 3002 + SSL


5. Tester les URLs dans le navigateur ← terminé ✅


Étape finale — Tester dans le navigateur
https://api.boutique.bem.sn/api/docs  → Swagger ✅
https://boutique.bem.sn               → Frontend ✅