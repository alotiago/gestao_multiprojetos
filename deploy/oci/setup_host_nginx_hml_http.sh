#!/usr/bin/env bash
set -euo pipefail

HML_DOMAIN="gestaodeprojetoshml.oais.cloud"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) HML_DOMAIN="$2"; shift 2 ;;
    *) echo "Parametro invalido: $1" >&2; exit 1 ;;
  esac
done

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
fail() { echo "ERRO: $*" >&2; exit 1; }

[[ $EUID -ne 0 ]] && fail "Execute como root (sudo)"

log "Instalando/verificando nginx..."
apt-get update -qq
apt-get install -y nginx

log "Validando endpoint interno do GMP em 127.0.0.1:8081..."
if curl -s --max-time 3 http://127.0.0.1:8081/health | grep -qiE 'ok|status|healthy'; then
  log "Aplicacao respondendo em 127.0.0.1:8081"
else
  log "AVISO: health interno ainda nao respondeu com sucesso. Continuando mesmo assim."
fi

log "Escrevendo vhost HTTP do host nginx para ${HML_DOMAIN}..."
cat > /etc/nginx/sites-available/gmp-hml <<EOF
server {
    listen 80;
    server_name ${HML_DOMAIN};

    location / {
        proxy_pass         http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 120s;
        client_max_body_size 50M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/gmp-hml /etc/nginx/sites-enabled/gmp-hml
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx || systemctl start nginx

log "Gateway HTTP configurado com sucesso. Validacoes sugeridas:"
log "  curl -s http://127.0.0.1:8081/health"
log "  curl -s http://127.0.0.1/health -H 'Host: ${HML_DOMAIN}'"
log "  curl -I http://${HML_DOMAIN}"