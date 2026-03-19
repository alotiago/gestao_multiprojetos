#!/usr/bin/env bash
# ===========================================================
# setup_host_nginx.sh — Gateway nginx HOST para múltiplas apps
# VM 10.10.11.92 — Ubuntu 24.04
#
# Configura nginx do HOST como entrada 80/443 para:
#   apoioarquivistico.oais.cloud  -> 127.0.0.1:8080 (GAA)
#   gestaodeprojetos.oais.cloud   -> 127.0.0.1:8081 (GMP)
#
# Uso: sudo bash /opt/gestor_multiprojetos/deploy/oci/setup_host_nginx.sh [--email EMAIL]
#
# PRÉ-REQUISITOS:
#   - GAA rodando em /opt/gestao_de_apoio_arquivistico
#   - GMP rodando em /opt/gestor_multiprojetos
#   - DNS de ambos os domínios aponta para este servidor (via NAT)
# ===========================================================
set -euo pipefail

GAA_DOMAIN="apoioarquivistico.oais.cloud"
GMP_DOMAIN="gestaodeprojetos.oais.cloud"
GAA_DIR="/opt/gestao_de_apoio_arquivistico"
GMP_DIR="/opt/gestor_multiprojetos"
EMAIL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --email) EMAIL="$2"; shift 2 ;;
    *) echo "Parâmetro desconhecido: $1" >&2; exit 1 ;;
  esac
done

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
fail() { echo "ERRO: $*" >&2; exit 1; }

[[ $EUID -ne 0 ]] && fail "Execute como root (sudo)"

# -------------------------------------------------------
# 1. Instalar dependências
# -------------------------------------------------------
log "Verificando dependências..."
apt-get update -qq
if ! command -v nginx >/dev/null 2>&1; then
  log "Instalando nginx..."
  apt-get install -y nginx
fi
# Instalar/garantir certbot + plugin nginx sempre (idempotente)
log "Instalando/garantindo certbot + plugin nginx..."
apt-get install -y certbot python3-certbot-nginx

# -------------------------------------------------------
# 2. Migrar GAA: liberar porta 80/443 do container nginx
#    e mover para 127.0.0.1:8080 (interno)
# -------------------------------------------------------
log "=== Migrando GAA nginx para porta interna 8080 ==="

if [[ ! -d "${GAA_DIR}" ]]; then
  fail "Diretório GAA não encontrado: ${GAA_DIR}"
fi

# 2a. Reescrever nginx.conf do GAA container para HTTP-only
#     (o enable_https_letsencrypt.sh havia adicionado HTTPS/redirect)
log "  Escrevendo nginx.conf HTTP-only para GAA..."
cat > "${GAA_DIR}/deploy/oci/nginx.conf" <<'GAACONF'
server {
    listen 80;
    server_name _;

    client_max_body_size 50m;
    proxy_connect_timeout 30s;
    proxy_send_timeout    120s;
    proxy_read_timeout    120s;

    location /api/v1/ {
        proxy_pass         http://backend:8000/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
    }

    location = /health {
        proxy_pass         http://backend:8000/health;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        access_log         off;
    }

    location = /ready {
        proxy_pass         http://backend:8000/ready;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    location = /openapi.json {
        proxy_pass         http://backend:8000/openapi.json;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    location /docs {
        proxy_pass         http://backend:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    location /redoc {
        proxy_pass         http://backend:8000/redoc;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    location /_static/swagger-ui/ {
        proxy_pass         http://backend:8000/_static/swagger-ui/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    location = /robots.txt {
        proxy_pass         http://backend:8000/robots.txt;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    location = /sitemap.xml {
        proxy_pass         http://backend:8000/sitemap.xml;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    location / {
        proxy_pass         http://frontend:4000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
GAACONF

# 2b. Corrigir docker-compose.oci.yml do GAA:
#     80:80 -> 127.0.0.1:8080:80, remover 443:443, remover letsencrypt volume
log "  Atualizando docker-compose.oci.yml do GAA..."
COMPOSE_GAA="${GAA_DIR}/docker-compose.oci.yml"

# Alterar binding da porta 80
sed -i 's|"\s*80:80\s*"|"127.0.0.1:8080:80"|g' "${COMPOSE_GAA}"
# Remover linha de porta 443 (pode ter aspas duplas ou sem)
sed -i '/"\s*443:443\s*"/d' "${COMPOSE_GAA}"
# Remover volume letsencrypt do nginx container
sed -i '/\/etc\/letsencrypt:\/etc\/letsencrypt:ro/d' "${COMPOSE_GAA}"

# 2c. Recriar nginx do GAA para aplicar novas portas/mounts
log "  Recriando nginx container do GAA..."
cd "${GAA_DIR}"
docker compose -f docker-compose.oci.yml up -d --no-deps --force-recreate nginx
sleep 3

# Confirmar que nginx GAA está em 8080
if curl -s --max-time 3 http://127.0.0.1:8080/health | grep -q 'status\|healthy'; then
  log "  ✅ GAA respondendo em 127.0.0.1:8080"
else
  log "  ⚠️  GAA pode ainda estar inicializando em 8080 — continue mesmo assim"
fi

# -------------------------------------------------------
# 3. Confirmar GMP está rodando em 8081
# -------------------------------------------------------
log "=== Verificando Gestor Multiprojetos em 8081 ==="
if [[ ! -d "${GMP_DIR}" ]]; then
  fail "Diretório GMP não encontrado: ${GMP_DIR}. Execute full_deploy_vm.sh antes."
fi
if curl -s --max-time 3 http://127.0.0.1:8081/health | grep -q 'status\|ok\|healthy'; then
  log "  ✅ GMP respondendo em 127.0.0.1:8081"
else
  log "  ⚠️  GMP pode ainda estar inicializando em 8081 — continue mesmo assim"
fi

# -------------------------------------------------------
# 4. Escrever virtual hosts HTTP no nginx HOST
# -------------------------------------------------------
log "=== Configurando virtual hosts no nginx HOST ==="

# Para certbot --nginx funcionar, os server_name precisam existir antes
cat > /etc/nginx/sites-available/gaa <<GAA
server {
    listen 80;
    server_name ${GAA_DOMAIN};

    location / {
        proxy_pass         http://127.0.0.1:8080;
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
GAA

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

ln -sf /etc/nginx/sites-available/gaa /etc/nginx/sites-enabled/gaa
ln -sf /etc/nginx/sites-available/gmp /etc/nginx/sites-enabled/gmp
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx || systemctl start nginx

log "nginx HOST iniciado com virtual hosts HTTP"

# -------------------------------------------------------
# 5. Emitir certificados via certbot --nginx
# -------------------------------------------------------
log "=== Emitindo certificados Let's Encrypt ==="
log "(Modo sem redirect HTTP->HTTPS para compatibilidade com edge TLS termination)"

CERTBOT_FLAGS=("--nginx" "--agree-tos" "--non-interactive" "--no-redirect")
if [[ -n "${EMAIL}" ]]; then
  CERTBOT_FLAGS+=("-m" "${EMAIL}")
else
  CERTBOT_FLAGS+=("--register-unsafely-without-email")
fi

log "  Emitindo cert para ${GAA_DOMAIN}..."
certbot "${CERTBOT_FLAGS[@]}" -d "${GAA_DOMAIN}" \
  && log "  ✅ ${GAA_DOMAIN} OK" \
  || log "  ⚠️  certbot ${GAA_DOMAIN} falhou — verifique DNS/ACME e tente manualmente"

log "  Emitindo cert para ${GMP_DOMAIN}..."
certbot "${CERTBOT_FLAGS[@]}" -d "${GMP_DOMAIN}" \
  && log "  ✅ ${GMP_DOMAIN} OK" \
  || log "  ⚠️  certbot ${GMP_DOMAIN} falhou — verifique DNS/ACME e tente manualmente"

# -------------------------------------------------------
# 6. Configurar renovação automática
# -------------------------------------------------------
log "=== Configurando renovação automática ==="
cat > /etc/cron.d/certbot-oais-cloud <<'CRON'
# Renovação automática Let's Encrypt — todos os domínios oais.cloud
0 3 * * 0 root certbot renew --nginx --quiet --post-hook "systemctl reload nginx"
CRON
chmod 644 /etc/cron.d/certbot-oais-cloud
log "  Cron configurado: toda domingo 03:00"

# -------------------------------------------------------
# 7. Recarregar nginx e verificar
# -------------------------------------------------------
nginx -t
systemctl reload nginx

log ""
log "=========================================="
log "Gateway pronto! Resultados:"
sleep 5
for domain in "${GAA_DOMAIN}" "${GMP_DOMAIN}"; do
  code=$(curl -s --max-time 10 -o /dev/null -w '%{http_code}' "http://127.0.0.1/health" -H "Host: ${domain}" 2>/dev/null || echo "ERR")
  if [[ "$code" =~ ^[23] ]]; then
    log "  ✅ ${domain} (/health via host nginx local) → HTTP $code"
  else
    log "  ⚠️  ${domain} (/health via host nginx local) → HTTP $code"
  fi
done
log ""
log "  Rotas configuradas:"
log "    ${GAA_DOMAIN}  → 127.0.0.1:8080 (GAA)"
log "    ${GMP_DOMAIN} → 127.0.0.1:8081 (GMP)"
log "=========================================="
