#!/usr/bin/env bash
set -euo pipefail

APP_DOMAIN=""
API_DOMAIN=""
EMAIL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --app-domain) APP_DOMAIN="$2"; shift 2 ;;
    --api-domain) API_DOMAIN="$2"; shift 2 ;;
    --email) EMAIL="$2"; shift 2 ;;
    *)
      echo "Parâmetro inválido: $1"
      echo "Uso: $0 --app-domain app.exemplo.com --api-domain api.exemplo.com --email voce@exemplo.com"
      exit 1
      ;;
  esac
done

if [[ -z "$APP_DOMAIN" || -z "$API_DOMAIN" || -z "$EMAIL" ]]; then
  echo "Informe --app-domain, --api-domain e --email"
  exit 1
fi

sudo tee /etc/nginx/sites-available/gestor_multiprojetos >/dev/null <<EOF
server {
    listen 80;
    server_name ${APP_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name ${API_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/gestor_multiprojetos /etc/nginx/sites-enabled/gestor_multiprojetos
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d "$APP_DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

sudo systemctl reload nginx

echo "Nginx + SSL configurados com sucesso."
