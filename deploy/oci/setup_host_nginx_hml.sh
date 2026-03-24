#!/usr/bin/env bash
# ===========================================================
# setup_host_nginx_hml.sh - Host nginx gateway for GMP HML
# VM: 10.10.11.93
# Domain: gestaodeprojetoshml.oais.cloud
#
# Usage:
#   sudo bash /opt/gestor_multiprojetos/deploy/oci/setup_host_nginx_hml.sh [--email EMAIL] [--domain DOMAIN]
# ===========================================================
set -euo pipefail

HML_DOMAIN="gestaodeprojetoshml.oais.cloud"
EMAIL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --email) EMAIL="$2"; shift 2 ;;
    --domain) HML_DOMAIN="$2"; shift 2 ;;
    *) echo "Unknown parameter: $1" >&2; exit 1 ;;
  esac
done

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
fail() { echo "ERROR: $*" >&2; exit 1; }

[[ $EUID -ne 0 ]] && fail "Run as root (sudo)"

log "Installing/checking nginx + certbot..."
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx

log "Checking internal GMP endpoint on 127.0.0.1:8081..."
if curl -s --max-time 3 http://127.0.0.1:8081/health | grep -qiE 'ok|status|healthy'; then
  log "GMP is responding on 127.0.0.1:8081"
else
  log "WARNING: GMP health did not return success yet. Continuing."
fi

log "Writing host nginx vhost for ${HML_DOMAIN}..."
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

log "Requesting Let's Encrypt certificate for ${HML_DOMAIN}..."
CERTBOT_FLAGS=("--nginx" "--agree-tos" "--non-interactive" "--no-redirect")
if [[ -n "${EMAIL}" ]]; then
  CERTBOT_FLAGS+=("-m" "${EMAIL}")
else
  CERTBOT_FLAGS+=("--register-unsafely-without-email")
fi

if certbot "${CERTBOT_FLAGS[@]}" -d "${HML_DOMAIN}"; then
  log "Certificate issued successfully"
else
  log "WARNING: certbot failed. Check DNS and rerun manually"
fi

log "Done. Validate with:"
log "  curl -s http://127.0.0.1:8081/health"
log "  curl -s http://127.0.0.1/health -H 'Host: ${HML_DOMAIN}'"
log "  curl -sk https://${HML_DOMAIN}/health"
