#!/usr/bin/env bash
# ===========================================================
# full_deploy_vm.sh — Primeiro deploy do Gestor Multiprojetos
# VM Ubuntu 24.04 / OCI
#
# Uso:
#   sudo bash full_deploy_vm.sh \
#     --repo-url https://github.com/ORG/gestor_multiprojetos.git \
#     [--branch master] \
#     [--domain gestaodeprojetos.oais.cloud] \
#     [--seed]
#
# Para atualizar uma versão existente, use update_deploy.sh
# ===========================================================
set -euo pipefail

APP_DIR="/opt/gestor_multiprojetos"
BRANCH="master"
REPO_URL=""
DOMAIN="gestaodeprojetos.oais.cloud"
COMPOSE_FILE="docker-compose.oci.yml"
RUN_SEED="false"
BUILD_NO_CACHE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo-url)      REPO_URL="$2";    shift 2 ;;
    --branch)        BRANCH="$2";      shift 2 ;;
    --app-dir)       APP_DIR="$2";     shift 2 ;;
    --domain)        DOMAIN="$2";      shift 2 ;;
    --seed)          RUN_SEED="true";  shift ;;
    --no-cache)      BUILD_NO_CACHE="true"; shift ;;
    *)
      echo "Parâmetro inválido: $1"
      echo "Uso: $0 --repo-url URL [--branch BRANCH] [--domain DOMAIN] [--seed] [--no-cache]"
      exit 1
      ;;
  esac
done

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
fail() { echo "ERRO: $*" >&2; exit 1; }

[[ $EUID -ne 0 ]] && fail "Execute como root (sudo)"

# -------------------------------------------------------
# 1. Verificar dependências
# -------------------------------------------------------
command -v docker  >/dev/null 2>&1 || fail "Docker não encontrado. Instale com: apt-get install -y docker.io docker-compose-v2"
command -v git     >/dev/null 2>&1 || fail "git não encontrado. Instale com: apt-get install -y git"

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  fail "Docker Compose não encontrado."
fi

# -------------------------------------------------------
# 2. Clonar ou atualizar repositório
# -------------------------------------------------------
if [[ -d "${APP_DIR}/.git" ]]; then
  log "Repositório existente — atualizando..."
  git -C "${APP_DIR}" fetch --all --prune
  git -C "${APP_DIR}" checkout "${BRANCH}"
  git -C "${APP_DIR}" pull --ff-only origin "${BRANCH}"
else
  [[ -z "${REPO_URL}" ]] && fail "Repositório não encontrado em ${APP_DIR}. Informe --repo-url"
  log "Clonando repositório..."
  git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"

# -------------------------------------------------------
# 3. Gerar .env de produção (se ainda não existe)
# -------------------------------------------------------
if [[ ! -f "${APP_DIR}/.env" ]]; then
  log "Gerando .env de produção..."
  APP_DIR="${APP_DIR}" DOMAIN="${DOMAIN}" bash "${APP_DIR}/deploy/oci/remote_prepare_env.sh"
else
  log ".env já existe — preservando segredos existentes"
fi

# -------------------------------------------------------
# 4. Permissões dos scripts
# -------------------------------------------------------
chmod +x "${APP_DIR}"/deploy/oci/*.sh 2>/dev/null || true

# -------------------------------------------------------
# 5. Build e subida da stack
# -------------------------------------------------------
log "Construindo imagens e subindo stack..."
if [[ "${BUILD_NO_CACHE}" == "true" ]]; then
  $COMPOSE_CMD -f "${COMPOSE_FILE}" build --no-cache
  $COMPOSE_CMD -f "${COMPOSE_FILE}" up -d
else
  $COMPOSE_CMD -f "${COMPOSE_FILE}" up -d --build
fi

# -------------------------------------------------------
# 6. Aguardar backend saudável
# -------------------------------------------------------
log "Aguardando backend inicializar..."
MAX_WAIT=120
WAITED=0
until docker inspect --format='{{.State.Health.Status}}' gmp-backend 2>/dev/null | grep -q 'healthy'; do
  sleep 5
  WAITED=$((WAITED + 5))
  [[ $WAITED -ge $MAX_WAIT ]] && { log "⚠️  Timeout aguardando backend — logs: docker logs gmp-backend"; break; }
  log "  ...aguardando ($WAITED/${MAX_WAIT}s)"
done

# -------------------------------------------------------
# 7. Migrations Prisma
# -------------------------------------------------------
log "Executando Prisma migrations..."
docker exec gmp-backend sh -c \
  "cd /app/apps/backend && npx prisma migrate deploy --schema=prisma/schema.prisma" \
  && log "✅ Migrations aplicadas" \
  || log "⚠️  Migrations falharam — verifique com: docker logs gmp-backend"

# -------------------------------------------------------
# 8. Seed inicial (opcional)
# -------------------------------------------------------
if [[ "${RUN_SEED}" == "true" ]]; then
  log "Executando seed de dados iniciais..."
  if docker exec gmp-backend sh -c \
    "cd /app/apps/backend && npx prisma db seed --schema=prisma/schema.prisma"; then
    log "✅ Seed concluído (admin@sistema.com / Admin123!)"
  else
    log "⚠️  Seed TS falhou (ts-node ausente no runtime). Tentando fallback JS..."
    if [[ -f "${APP_DIR}/deploy/oci/seed-users.js" ]]; then
      docker cp "${APP_DIR}/deploy/oci/seed-users.js" gmp-backend:/app/apps/backend/seed-users.js
      docker exec gmp-backend sh -c "cd /app/apps/backend && node seed-users.js"
      log "✅ Seed fallback concluído (admin@sistema.com / Admin123!)"
    else
      log "⚠️  Seed fallback indisponível (arquivo deploy/oci/seed-users.js não encontrado)"
    fi
  fi
fi

# -------------------------------------------------------
# 9. Verificação final
# -------------------------------------------------------
log "Verificando serviço em 127.0.0.1:8081..."
sleep 3
code=$(curl -s --max-time 10 -o /dev/null -w '%{http_code}' http://127.0.0.1:8081/health 2>/dev/null || echo "ERR")
if [[ "$code" =~ ^[23] ]]; then
  log "✅ /health → HTTP $code"
else
  log "⚠️  /health → HTTP $code — verifique: docker logs gmp-nginx && docker logs gmp-backend"
fi

log ""
log "=========================================="
log "Deploy do Gestor Multiprojetos concluído!"
log "  Stack: ${APP_DIR}"
log "  Nginx interno: 127.0.0.1:8081"
log ""
log "Próximo passo — ativar HTTPS e gateway:"
log "  sudo bash ${APP_DIR}/deploy/oci/setup_host_nginx.sh [--email EMAIL]"
log "=========================================="
