#!/usr/bin/env bash
set -euo pipefail

# Setup a homologation environment on the same OCI VM used by production.
# It creates isolated apps/ports/DB and configures Nginx host routing via nip.io.
#
# Required:
#   VM_IP=<public_ip>
# Optional:
#   SSH_KEY_PATH=~/.ssh/id_rsa
#   HML_HOST=hml.<ip>.nip.io
#   HML_DB_NAME=gestor_multiprojetos_hml
#   HML_DB_USER=gestor_hml
#   HML_DB_PASSWORD=<custom>
#   SOURCE_ARCHIVE=/caminho/projeto.tar.gz
#   REPO_URL=https://github.com/org/repo.git
#   BRANCH=main
#   RUN_SEED=true

# Regras de segurança operacional:
# - nunca copia código a partir do diretório de produção da VM
# - nunca sincroniza dados de projeto entre ambientes
# - preserva arquivos persistentes do ambiente (uploads/logs/.env)
# - seed desabilitado por padrão

VM_IP="${VM_IP:-}"
SSH_KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_rsa}"
HML_HOST="${HML_HOST:-}"
HML_DB_NAME="${HML_DB_NAME:-gestor_multiprojetos_hml}"
HML_DB_USER="${HML_DB_USER:-gestor_hml}"
HML_DB_PASSWORD="${HML_DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=')}"
SOURCE_ARCHIVE="${SOURCE_ARCHIVE:-}"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-main}"
RUN_SEED="${RUN_SEED:-false}"
GIT_TOKEN="${GIT_TOKEN:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_SOURCE_ARCHIVE=""

if [[ -z "$VM_IP" ]]; then
  echo "[ERRO] Defina VM_IP. Exemplo: VM_IP=163.176.202.166 bash scripts/setup-homolog-vm.sh" >&2
  exit 1
fi

if [[ ! -f "$SSH_KEY_PATH" ]]; then
  echo "[ERRO] Chave SSH nao encontrada em $SSH_KEY_PATH" >&2
  exit 1
fi

if [[ -z "$HML_HOST" ]]; then
  HML_HOST="hml.${VM_IP}.nip.io"
fi

if [[ -z "$SOURCE_ARCHIVE" && -z "$REPO_URL" ]]; then
  TEMP_SOURCE_ARCHIVE="$(mktemp "${TMPDIR:-/tmp}/gestor_hml_src.XXXXXX.tar.gz")"
  tar -czf "$TEMP_SOURCE_ARCHIVE" \
    --exclude=.git \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.turbo \
    --exclude=apps/frontend/.next \
    --exclude=apps/frontend/node_modules \
    --exclude=apps/backend/node_modules \
    --exclude=apps/frontend/test-results \
    --exclude=apps/backend/dist \
    --exclude=apps/backend/coverage \
    --exclude=deploy-src.tar.gz \
    --exclude=deploy-secrets.env \
    -C "$REPO_ROOT" .
  SOURCE_ARCHIVE="$TEMP_SOURCE_ARCHIVE"
fi

cleanup() {
  if [[ -n "$TEMP_SOURCE_ARCHIVE" && -f "$TEMP_SOURCE_ARCHIVE" ]]; then
    rm -f "$TEMP_SOURCE_ARCHIVE"
  fi
}
trap cleanup EXIT

SSH_OPTS=(
  -i "$SSH_KEY_PATH"
  -o StrictHostKeyChecking=no
  -o ConnectTimeout=20
)
SCP_OPTS=(
  -i "$SSH_KEY_PATH"
  -o StrictHostKeyChecking=no
)

echo "[INFO] VM: $VM_IP"
echo "[INFO] Host homolog: $HML_HOST"
echo "[INFO] DB homolog: $HML_DB_NAME ($HML_DB_USER)"
echo "[INFO] Seed: $RUN_SEED"

SOURCE_MODE="git"
REMOTE_ARCHIVE=""
REPO_URL_WITH_TOKEN="$REPO_URL"

if [[ -n "$SOURCE_ARCHIVE" ]]; then
  SOURCE_MODE="archive"
  REMOTE_ARCHIVE="/tmp/gestor_multiprojetos_hml_src.tar.gz"
  scp "${SCP_OPTS[@]}" "$SOURCE_ARCHIVE" "ubuntu@${VM_IP}:${REMOTE_ARCHIVE}"
elif [[ -n "$GIT_TOKEN" ]]; then
  REPO_URL_WITH_TOKEN="${REPO_URL/https:\/\//https:\/\/${GIT_TOKEN}@}"
fi

# Quick SSH check first.
ssh "${SSH_OPTS[@]}" "ubuntu@${VM_IP}" "echo SSH_OK" >/dev/null

ssh "${SSH_OPTS[@]}" "ubuntu@${VM_IP}" \
  HML_HOST="$HML_HOST" \
  HML_DB_NAME="$HML_DB_NAME" \
  HML_DB_USER="$HML_DB_USER" \
  HML_DB_PASSWORD="$HML_DB_PASSWORD" \
  SOURCE_MODE="$SOURCE_MODE" \
  REMOTE_ARCHIVE="$REMOTE_ARCHIVE" \
  REPO_URL="$REPO_URL_WITH_TOKEN" \
  BRANCH="$BRANCH" \
  RUN_SEED="$RUN_SEED" \
  'bash -s' <<'REMOTE_SCRIPT'
set -euo pipefail

HML_DIR="/opt/gestor_multiprojetos_hml"
HML_BACKEND_PORT="3101"
HML_FRONTEND_PORT="3100"

read_env_value() {
  local key="$1"
  local file="$2"
  [[ -f "$file" ]] || return 0
  grep -E "^${key}=" "$file" | tail -n1 | cut -d= -f2- || true
}

echo "[REMOTE] Iniciando setup de homolog..."

if ! command -v rsync >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq rsync
fi

EXISTING_HML_ENV="$HML_DIR/.env"
if [[ -f "$EXISTING_HML_ENV" ]]; then
  EXISTING_DB_PASSWORD="$(read_env_value DATABASE_PASSWORD "$EXISTING_HML_ENV")"
  EXISTING_JWT_SECRET="$(read_env_value JWT_SECRET "$EXISTING_HML_ENV")"
  EXISTING_JWT_REFRESH_SECRET="$(read_env_value JWT_REFRESH_SECRET "$EXISTING_HML_ENV")"

  [[ -n "$EXISTING_DB_PASSWORD" ]] && HML_DB_PASSWORD="$EXISTING_DB_PASSWORD"
  [[ -n "$EXISTING_JWT_SECRET" ]] && JWT_SECRET="$EXISTING_JWT_SECRET"
  [[ -n "$EXISTING_JWT_REFRESH_SECRET" ]] && JWT_REFRESH_SECRET="$EXISTING_JWT_REFRESH_SECRET"
fi

if [[ -z "${JWT_SECRET:-}" ]]; then JWT_SECRET="$(openssl rand -base64 32)"; fi
if [[ -z "${JWT_REFRESH_SECRET:-}" ]]; then JWT_REFRESH_SECRET="$(openssl rand -base64 32)"; fi

# 1) Ensure DB role and DB for homolog
ROLE_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${HML_DB_USER}'" | tr -d '[:space:]')
if [[ "$ROLE_EXISTS" != "1" ]]; then
  sudo -u postgres psql -c "CREATE USER ${HML_DB_USER} WITH PASSWORD '${HML_DB_PASSWORD}';"
else
  sudo -u postgres psql -c "ALTER USER ${HML_DB_USER} WITH PASSWORD '${HML_DB_PASSWORD}';"
fi

DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${HML_DB_NAME}'" | tr -d '[:space:]')
if [[ "$DB_EXISTS" != "1" ]]; then
  sudo -u postgres psql -c "CREATE DATABASE ${HML_DB_NAME} OWNER ${HML_DB_USER};"
fi

# 2) Sync code from explicit source artifact/repository to homolog workspace
TMP_SRC_DIR="$(mktemp -d /tmp/gestor_hml_src.XXXXXX)"
if [[ "$SOURCE_MODE" == "archive" ]]; then
  tar -xzf "$REMOTE_ARCHIVE" -C "$TMP_SRC_DIR"
  rm -f "$REMOTE_ARCHIVE"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$TMP_SRC_DIR"
fi

sudo mkdir -p "$HML_DIR"
sudo chown -R ubuntu:ubuntu "$HML_DIR"
rsync -a --delete \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'apps/backend/.env' \
  --exclude 'apps/frontend/.env.local' \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude 'logs' \
  --exclude 'uploads' \
  "$TMP_SRC_DIR/" "$HML_DIR/"
rm -rf "$TMP_SRC_DIR"

# 3) Prepare env files for homolog
REDIS_PASSWORD="$(read_env_value REDIS_PASSWORD "$EXISTING_HML_ENV")"
if [[ -z "$REDIS_PASSWORD" ]]; then
  REDIS_PASSWORD="$(sudo awk '/^requirepass / { print $2 }' /etc/redis/redis.conf | tail -n1)"
fi

DATABASE_URL="postgresql://${HML_DB_USER}:${HML_DB_PASSWORD}@localhost:5432/${HML_DB_NAME}?schema=public"

cat > "${HML_DIR}/.env" <<ENVEOF
NODE_ENV=production
LOG_LEVEL=info

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=${HML_DB_NAME}
DATABASE_USER=${HML_DB_USER}
DATABASE_PASSWORD=${HML_DB_PASSWORD}
DATABASE_URL=${DATABASE_URL}

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

BACKEND_PORT=${HML_BACKEND_PORT}
BACKEND_HOST=0.0.0.0
BACKEND_URL=http://${HML_HOST}/api
FRONTEND_URL=http://${HML_HOST}
CORS_ORIGINS=http://${HML_HOST}

JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRATION=24h

PORT=${HML_BACKEND_PORT}
UPLOAD_DIR=${HML_DIR}/uploads
MAX_FILE_SIZE=52428800

NEXT_PUBLIC_API_URL=http://${HML_HOST}/api
NEXT_PUBLIC_APP_URL=http://${HML_HOST}
ENVEOF

cp "${HML_DIR}/.env" "${HML_DIR}/apps/backend/.env"
cat > "${HML_DIR}/apps/frontend/.env.local" <<FRONTENV
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://${HML_HOST}/api
NEXT_PUBLIC_APP_URL=http://${HML_HOST}
FRONTENV

mkdir -p "${HML_DIR}/logs" "${HML_DIR}/uploads"

# 4) Install dependencies, build backend and run migrations on homolog DB
cd "${HML_DIR}"
npm ci --prefer-offline --no-audit

cd "${HML_DIR}/apps/backend"
rm -f tsconfig.tsbuildinfo
rm -rf dist
npm run build
DATABASE_URL="${DATABASE_URL}" npx prisma migrate deploy --schema=prisma/schema.prisma
if [[ "$RUN_SEED" == "true" ]]; then
  DATABASE_URL="${DATABASE_URL}" npx prisma db seed --schema=prisma/schema.prisma || true
else
  echo "[REMOTE] Seed desabilitado para preservar os dados da homologação."
fi

# 5) Build frontend with homolog API URL
cd "${HML_DIR}/apps/frontend"
rm -f tsconfig.tsbuildinfo
rm -rf .next
NEXT_PUBLIC_API_URL="http://${HML_HOST}/api" NODE_ENV=production npm run build

# 6) PM2 processes for homolog
cat > "${HML_DIR}/ecosystem.hml.config.js" <<PM2EOF
module.exports = {
  apps: [
    {
      name: 'gestor-backend-hml',
      script: '${HML_DIR}/apps/backend/dist/main.js',
      cwd: '${HML_DIR}',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        BACKEND_PORT: ${HML_BACKEND_PORT},
      },
      max_memory_restart: '350M',
      error_file: '${HML_DIR}/logs/backend-hml-error.log',
      out_file: '${HML_DIR}/logs/backend-hml-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
    },
    {
      name: 'gestor-frontend-hml',
      script: '${HML_DIR}/node_modules/.bin/next',
      args: 'start --port ${HML_FRONTEND_PORT}',
      cwd: '${HML_DIR}/apps/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '300M',
      error_file: '${HML_DIR}/logs/frontend-hml-error.log',
      out_file: '${HML_DIR}/logs/frontend-hml-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
    },
  ],
};
PM2EOF

pm2 delete gestor-backend-hml 2>/dev/null || true
pm2 delete gestor-frontend-hml 2>/dev/null || true
pm2 start "${HML_DIR}/ecosystem.hml.config.js"
pm2 save

# 7) Nginx host-based route for homolog (no impact on production host)
sudo tee /etc/nginx/sites-available/gestor-multiprojetos-hml > /dev/null <<NGINXEOF
upstream gestor_backend_hml {
    server 127.0.0.1:${HML_BACKEND_PORT};
    keepalive 16;
}

upstream gestor_frontend_hml {
    server 127.0.0.1:${HML_FRONTEND_PORT};
    keepalive 16;
}

server {
    listen 80;
    server_name ${HML_HOST};

    access_log /var/log/nginx/gestor-hml-access.log;
    error_log  /var/log/nginx/gestor-hml-error.log;

    location /api/ {
        proxy_pass         http://gestor_backend_hml/;
        proxy_http_version 1.1;
      proxy_set_header   Host              \$host;
      proxy_set_header   X-Real-IP         \$remote_addr;
      proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
      proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Connection        "";
        proxy_read_timeout 120s;
    }

    location /health {
        proxy_pass http://gestor_backend_hml/health;
      proxy_set_header Host \$host;
        access_log off;
    }

    location /_next/static/ {
        proxy_pass http://gestor_frontend_hml;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable, max-age=31536000";
      proxy_set_header Host \$host;
    }

    location / {
        proxy_pass         http://gestor_frontend_hml;
        proxy_http_version 1.1;
      proxy_set_header   Host              \$host;
      proxy_set_header   X-Real-IP         \$remote_addr;
      proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
      proxy_set_header   X-Forwarded-Proto \$scheme;
      proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
NGINXEOF

sudo ln -sfn /etc/nginx/sites-available/gestor-multiprojetos-hml /etc/nginx/sites-enabled/gestor-multiprojetos-hml
sudo nginx -t
sudo systemctl reload nginx

# 8) Validation (with retry to avoid transient startup race after PM2 restart)
for i in {1..30}; do
  if curl -sf "http://127.0.0.1:${HML_BACKEND_PORT}/health" >/dev/null; then
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "[ERRO] Backend homolog nao respondeu em /health" >&2
    exit 1
  fi
  sleep 2
done

for i in {1..30}; do
  if curl -sf -H "Host: ${HML_HOST}" "http://127.0.0.1/" >/dev/null; then
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "[ERRO] Frontend homolog nao respondeu via nginx" >&2
    exit 1
  fi
  sleep 2
done

for i in {1..30}; do
  if curl -sf -H "Host: ${HML_HOST}" "http://127.0.0.1/api/health" >/dev/null; then
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    echo "[ERRO] API homolog nao respondeu via nginx" >&2
    exit 1
  fi
  sleep 2
done

echo "[REMOTE] Homolog configurada com sucesso"
echo "[REMOTE] URL: http://${HML_HOST}"
echo "[REMOTE] API: http://${HML_HOST}/api/health"
REMOTE_SCRIPT

echo "[OK] Ambiente de homologacao criado"
echo "[OK] Frontend homolog: http://${HML_HOST}"
echo "[OK] API homolog:      http://${HML_HOST}/api/health"
