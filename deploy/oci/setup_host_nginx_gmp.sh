#!/usr/bin/env bash
# ===========================================================
# setup_host_nginx_gmp.sh — Gateway nginx HOST exclusivo do GMP
# VM 10.10.11.92 — Ubuntu 24.04
#
# Configura nginx do HOST como entrada 80/443 para:
#   gestaodeprojetos.oais.cloud -> 127.0.0.1:8081 (GMP)
#
# Uso: sudo bash /opt/gestor_multiprojetos/deploy/oci/setup_host_nginx_gmp.sh [--email EMAIL] [--domain DOMAIN]
#
# PRÉ-REQUISITOS:
#   - GMP rodando em /opt/gestor_multiprojetos
#   - DNS do domínio aponta para este servidor (via NAT)
# ===========================================================
set -euo pipefail

GMP_DOMAIN="gestaodeprojetos.oais.cloud"
GMP_DIR="/opt/gestor_multiprojetos"
EMAIL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --email) EMAIL="$2"; shift 2 ;;
    --domain) GMP_DOMAIN="$2"; shift 2 ;;
    *) echo "Parâmetro desconhecido: $1" >&2; exit 1 ;;
  esac
done

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
fail() { echo "ERRO: $*" >&2; exit 1; }

[[ $EUID -ne 0 ]] && fail "Execute como root (sudo)"

log "Verificando dependências..."
apt-get update -qq
if ! command -v nginx >/dev/null 2>&1; then
  log "Instalando nginx..."
  apt-get install -y nginx
fi
log "Instalando/garantindo certbot + plugin nginx..."
apt-get install -y certbot python3-certbot-nginx

log "=== Verificando Gestor Multiprojetos em 8081 ==="
if [[ ! -d "${GMP_DIR}" ]]; then
  fail "Diretório GMP não encontrado: ${GMP_DIR}. Execute o deploy da aplicação antes."
fi
if curl -s --max-time 3 http://127.0.0.1:8081/health | grep -q 'status\|ok\|healthy'; then
  log "  ✅ GMP respondendo em 127.0.0.1:8081"
else
  log "  ⚠️  GMP pode ainda estar inicializando em 8081 — continue mesmo assim"
fi

log "=== Configurando virtual host do GMP no nginx HOST ==="
cat > /etc/nginx/sites-available/gmp <<GMP
server {
    listen 80;
    server_name ${GMP_DOMAIN};

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
GMP

ln -sf /etc/nginx/sites-available/gmp /etc/nginx/sites-enabled/gmp

nginx -t
systemctl enable nginx
systemctl reload nginx || systemctl start nginx

log "nginx HOST atualizado para o GMP"
log "=== Emitindo certificado Let's Encrypt do GMP ==="
log "(Modo sem redirect HTTP->HTTPS para compatibilidade com edge TLS termination)"

CERTBOT_FLAGS=("--nginx" "--agree-tos" "--non-interactive" "--no-redirect")
if [[ -n "${EMAIL}" ]]; then
  CERTBOT_FLAGS+=("-m" "${EMAIL}")
else
  CERTBOT_FLAGS+=("--register-unsafely-without-email")
fi

log "  Emitindo cert para ${GMP_DOMAIN}..."
certbot "${CERTBOT_FLAGS[@]}" -d "${GMP_DOMAIN}" \
  && log "  ✅ ${GMP_DOMAIN} OK" \
  || log "  ⚠️  certbot ${GMP_DOMAIN} falhou — verifique DNS/ACME e tente manualmente"

log "=== Configurando renovação automática ==="
cat > /etc/cron.d/certbot-gmp-oais-cloud <<'CRON'
# Renovação automática Let's Encrypt — GMP
0 3 * * 0 root certbot renew --nginx --quiet --post-hook "systemctl reload nginx"
CRON
chmod 644 /etc/cron.d/certbot-gmp-oais-cloud
log "  Cron configurado: todo domingo 03:00"

nginx -t
systemctl reload nginx

log ""
log "=========================================="
log "Gateway GMP pronto! Resultados:"
sleep 5
code=$(curl -s --max-time 10 -o /dev/null -w '%{http_code}' "http://127.0.0.1/health" -H "Host: ${GMP_DOMAIN}" 2>/dev/null || echo "ERR")
if [[ "$code" =~ ^[23] ]]; then
  log "  ✅ ${GMP_DOMAIN} (/health via host nginx local) → HTTP $code"
else
  log "  ⚠️  ${GMP_DOMAIN} (/health via host nginx local) → HTTP $code"
fi
log ""
log "  Rota configurada:"
log "    ${GMP_DOMAIN} → 127.0.0.1:8081 (GMP)"
log "=========================================="