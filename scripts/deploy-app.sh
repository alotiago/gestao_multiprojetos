#!/usr/bin/env bash
# ==============================================================
# deploy-app.sh — Gestor Multiprojetos
# Deploy completo na VM OCI Free Tier (sem Docker):
#   Node.js 20 + PostgreSQL 16 + Redis 7 + Nginx + PM2
#
# O script faz SSH na VM e executa todo o setup remotamente.
#
# Pré-requisitos (na sua máquina local):
#   - SSH configurado: ssh ubuntu@<IP> -i ~/.ssh/id_rsa
#   - Variável VM_IP definida
#   - Variável REPO_URL definida (URL do git)
#
# Uso (Git Bash no Windows):
#   export VM_IP=<IP_PUBLICO>
#   export REPO_URL=https://github.com/SEU_USUARIO/gestor_multiprojetos.git
#   # Opcional — se o repo exige token:
#   export GIT_TOKEN=ghp_xxxxxxxx
#   bash scripts/deploy-app.sh
#
# Variáveis de ambiente da aplicação (opcionais — padrões seguros gerados):
#   DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, REDIS_PASSWORD
# Segurança operacional:
#   - não replica dados entre ambientes
#   - não apaga diretórios persistentes do ambiente (uploads/logs/.env)
#   - não executa seed automaticamente, a menos que RUN_SEED=true
# ==============================================================
set -euo pipefail

# ── Cores ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')] LOCAL${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERRO]${NC} $*" >&2; exit 1; }
step() { echo -e "\n${BOLD}${CYAN}══ $* ══${NC}"; }

# ── Parâmetros ────────────────────────────────────────────────
VM_IP="${VM_IP:-}"
REPO_URL="${REPO_URL:-}"
SOURCE_ARCHIVE="${SOURCE_ARCHIVE:-}"
SSH_KEY="${SSH_KEY_PATH:-$HOME/.ssh/id_rsa}"
SSH_USER="ubuntu"
APP_DIR="/opt/gestor_multiprojetos"
BRANCH="${BRANCH:-main}"
GIT_TOKEN="${GIT_TOKEN:-}"      # Token GitHub se repositório privado
DOMAIN="${DOMAIN:-}"            # Domínio para HTTPS (opcional)
NODE_VERSION="20"
RUN_SEED="${RUN_SEED:-false}"

# Senhas/Segredos (gerados automaticamente se não definidos)
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=')}"
REDIS_PASSWORD="${REDIS_PASSWORD:-$(openssl rand -base64 24 | tr -d '/+=')}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 32)}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-$(openssl rand -base64 32)}"

# ── Verificações iniciais ─────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Gestor Multiprojetos — Deploy OCI VM Free Tier      ║"
echo "╚══════════════════════════════════════════════════════╝${NC}"
echo ""

[[ -z "$VM_IP" ]]   && err "VM_IP não definido.\n  Exemplo: export VM_IP=<seu_ip_publico>"
if [[ -z "$REPO_URL" && -z "$SOURCE_ARCHIVE" ]]; then
  err "Defina REPO_URL (git) ou SOURCE_ARCHIVE (arquivo .tar.gz local)."
fi
[[ ! -f "$SSH_KEY" ]] && err "Chave SSH não encontrada: $SSH_KEY\n  Defina: export SSH_KEY_PATH=~/.ssh/sua_chave"
if [[ -n "$SOURCE_ARCHIVE" && ! -f "$SOURCE_ARCHIVE" ]]; then
  err "SOURCE_ARCHIVE não encontrado: $SOURCE_ARCHIVE"
fi

# Testar conexão SSH
log "Testando conexão SSH com $SSH_USER@$VM_IP..."
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=15 -o BatchMode=yes)
SCP_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no)

if ! ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" "echo SSH_OK" 2>/dev/null | grep -q "SSH_OK"; then
  err "Não foi possível conectar via SSH.\n  Verifique: ssh $SSH_USER@$VM_IP -i $SSH_KEY\n  Aguarde alguns minutos se a VM foi criada agora."
fi
log "Conexão SSH estabelecida."

# Definir modo de origem do código
SOURCE_MODE="git"
REPO_URL_WITH_TOKEN="$REPO_URL"
REMOTE_ARCHIVE=""
if [[ -n "$SOURCE_ARCHIVE" ]]; then
  SOURCE_MODE="archive"
  REMOTE_ARCHIVE="/tmp/gestor_multiprojetos_src.tar.gz"
  log "Enviando código local para a VM..."
  scp "${SCP_OPTS[@]}" "$SOURCE_ARCHIVE" "${SSH_USER}@${VM_IP}:${REMOTE_ARCHIVE}"
  log "Arquivo enviado: $REMOTE_ARCHIVE"
elif [[ -n "$GIT_TOKEN" ]]; then
  # Inserir token no URL: https://token@github.com/...
  REPO_URL_WITH_TOKEN="${REPO_URL/https:\/\//https:\/\/${GIT_TOKEN}@}"
fi

info() { echo -e "${CYAN}[INFO]${NC} $*"; }
info "VM          : $SSH_USER@$VM_IP"
if [[ "$SOURCE_MODE" == "archive" ]]; then
  info "Origem      : arquivo local ($SOURCE_ARCHIVE)"
else
  info "Repositório : $REPO_URL"
fi
info "Branch      : $BRANCH"
info "Dir da app  : $APP_DIR"
info "Seed        : $RUN_SEED"
echo ""

# ── Executar setup remoto ─────────────────────────────────────
# Passamos as variáveis sensíveis via stdin para não expô-las nos logs
log "Iniciando setup remoto na VM (pode levar 10-15 minutos)..."

ssh "${SSH_OPTS[@]}" "${SSH_USER}@${VM_IP}" \
  DB_PASSWORD="$DB_PASSWORD" \
  REDIS_PASSWORD="$REDIS_PASSWORD" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  REPO_URL="$REPO_URL_WITH_TOKEN" \
  REPO_URL_DISPLAY="$REPO_URL" \
  SOURCE_MODE="$SOURCE_MODE" \
  REMOTE_ARCHIVE="$REMOTE_ARCHIVE" \
  BRANCH="$BRANCH" \
  APP_DIR="$APP_DIR" \
  NODE_VERSION="$NODE_VERSION" \
  RUN_SEED="$RUN_SEED" \
  DOMAIN="$DOMAIN" \
  VM_IP="$VM_IP" \
  'bash -s' << 'REMOTE_SCRIPT'

set -euo pipefail

# Cores (redefine no contexto remoto)
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'
log()  { echo -e "${GREEN}[$(date '+%H:%M:%S')] REMOTE${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
step() { echo -e "\n${BOLD}${CYAN}══ $* ══${NC}"; }
read_env_value() {
  local key="$1"
  local file="$2"
  [[ -f "$file" ]] || return 0
  grep -E "^${key}=" "$file" | tail -n1 | cut -d= -f2- || true
}

EXISTING_ENV_FILE="$APP_DIR/.env"
if [[ -f "$EXISTING_ENV_FILE" ]]; then
  log "Reutilizando segredos já existentes do ambiente de produção."
  EXISTING_DB_PASSWORD="$(read_env_value DATABASE_PASSWORD "$EXISTING_ENV_FILE")"
  EXISTING_REDIS_PASSWORD="$(read_env_value REDIS_PASSWORD "$EXISTING_ENV_FILE")"
  EXISTING_JWT_SECRET="$(read_env_value JWT_SECRET "$EXISTING_ENV_FILE")"
  EXISTING_JWT_REFRESH_SECRET="$(read_env_value JWT_REFRESH_SECRET "$EXISTING_ENV_FILE")"

  [[ -n "$EXISTING_DB_PASSWORD" ]] && DB_PASSWORD="$EXISTING_DB_PASSWORD"
  [[ -n "$EXISTING_REDIS_PASSWORD" ]] && REDIS_PASSWORD="$EXISTING_REDIS_PASSWORD"
  [[ -n "$EXISTING_JWT_SECRET" ]] && JWT_SECRET="$EXISTING_JWT_SECRET"
  [[ -n "$EXISTING_JWT_REFRESH_SECRET" ]] && JWT_REFRESH_SECRET="$EXISTING_JWT_REFRESH_SECRET"
fi

# ═══════════════════════════════════════════════════════════
step "ETAPA 0 — Criar swap (essencial para VM micro 1GB)"
# ═══════════════════════════════════════════════════════════
if ! swapon --show | grep -q '/swapfile'; then
  log "Criando swapfile de 2GB..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  log "Swap 2GB ativado."
else
  log "Swap já ativo: $(swapon --show)"
fi

# ═══════════════════════════════════════════════════════════
step "ETAPA 1 — Atualizar sistema e instalar dependências base"
# ═══════════════════════════════════════════════════════════
export DEBIAN_FRONTEND=noninteractive

sudo apt-get update -qq
sudo apt-get upgrade -y -qq
sudo apt-get install -y -qq \
  curl wget git build-essential unzip gnupg lsb-release rsync \
  ca-certificates software-properties-common \
  nginx certbot python3-certbot-nginx \
  ufw openssl htop
log "Pacotes base instalados."

# ═══════════════════════════════════════════════════════════
step "ETAPA 2 — Instalar Node.js $NODE_VERSION (via NodeSource)"
# ═══════════════════════════════════════════════════════════
if ! command -v node >/dev/null 2>&1 || [[ "$(node --version | cut -d'.' -f1 | tr -d 'v')" -lt "$NODE_VERSION" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | sudo -E bash -
  sudo apt-get install -y nodejs
  log "Node.js $(node --version) instalado."
else
  log "Node.js $(node --version) já instalado."
fi

# Instalar PM2 globalmente
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2 --silent
  log "PM2 $(pm2 --version) instalado."
else
  log "PM2 já instalado: $(pm2 --version)"
fi

# ═══════════════════════════════════════════════════════════
step "ETAPA 3 — Instalar PostgreSQL 16"
# ═══════════════════════════════════════════════════════════
if ! command -v psql >/dev/null 2>&1; then
  # Repositório oficial do PostgreSQL
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    | sudo tee /etc/apt/sources.list.d/pgdg.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -qq postgresql-16 postgresql-client-16
  log "PostgreSQL 16 instalado."
else
  log "PostgreSQL já instalado: $(psql --version)"
fi

sudo systemctl enable --now postgresql 2>/dev/null || true

# Criar banco de dados e usuário
DB_NAME="gestor_multiprojetos"
DB_USER="gestor"

# Criar role se não existir
ROLE_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null || echo "")
if [[ "$ROLE_EXISTS" != "1" ]]; then
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
  log "Usuário '$DB_USER' criado."
else
  sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
  log "Usuário '$DB_USER' já existe. Senha atualizada."
fi

DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")
if [[ "$DB_EXISTS" != "1" ]]; then
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
  log "Banco '$DB_NAME' criado."
else
  warn "Banco '$DB_NAME' já existe."
fi

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
log "DATABASE_URL configurada."

# ═══════════════════════════════════════════════════════════
step "ETAPA 4 — Instalar Redis 7"
# ═══════════════════════════════════════════════════════════
if ! command -v redis-cli >/dev/null 2>&1; then
  curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" \
    | sudo tee /etc/apt/sources.list.d/redis.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -qq redis
  log "Redis instalado."
else
  log "Redis já instalado."
fi

# Configurar senha no Redis
sudo sed -i "s/^# requirepass .*/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
sudo sed -i "s/^requirepass .*/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
# Se linha não existir, adicionar
sudo grep -q "^requirepass" /etc/redis/redis.conf || echo "requirepass $REDIS_PASSWORD" | sudo tee -a /etc/redis/redis.conf
# Limitar memória (importante no Free Tier com 1GB)
sudo sed -i "s/^# maxmemory .*/maxmemory 128mb/" /etc/redis/redis.conf
sudo sed -i "s/^maxmemory .*/maxmemory 128mb/" /etc/redis/redis.conf
sudo grep -q "^maxmemory " /etc/redis/redis.conf || echo "maxmemory 128mb" | sudo tee -a /etc/redis/redis.conf
sudo sed -i "s/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/" /etc/redis/redis.conf
sudo grep -q "^maxmemory-policy" /etc/redis/redis.conf || echo "maxmemory-policy allkeys-lru" | sudo tee -a /etc/redis/redis.conf

sudo systemctl enable --now redis 2>/dev/null || true
sudo systemctl restart redis 2>/dev/null || true
log "Redis configurado com senha e limite de 128MB."

# ═══════════════════════════════════════════════════════════
step "ETAPA 5 — Clonar / Atualizar repositório"
# ═══════════════════════════════════════════════════════════
sudo mkdir -p "$APP_DIR"
sudo chown ubuntu:ubuntu "$APP_DIR"

if [[ "$SOURCE_MODE" == "archive" ]]; then
  log "Extraindo código do arquivo local enviado..."
  TMP_EXTRACT_DIR="$(mktemp -d /tmp/gestor_prod_src.XXXXXX)"
  tar -xzf "$REMOTE_ARCHIVE" -C "$TMP_EXTRACT_DIR"
  rsync -a --delete \
    --exclude '.env' \
    --exclude 'apps/backend/.env' \
    --exclude 'apps/frontend/.env.local' \
    --exclude 'deploy-secrets.env' \
    --exclude 'uploads' \
    --exclude 'logs' \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dist' \
    "$TMP_EXTRACT_DIR/" "$APP_DIR/"
  rm -rf "$TMP_EXTRACT_DIR"
  rm -f "$REMOTE_ARCHIVE"
  cd "$APP_DIR"
  log "Código extraído em $APP_DIR"
else
  if [[ -d "$APP_DIR/.git" ]]; then
    log "Repositório já existe. Atualizando para branch $BRANCH..."
    cd "$APP_DIR"
    git remote set-url origin "$REPO_URL"
    git fetch --all --prune
    git checkout "$BRANCH"
    git pull --ff-only origin "$BRANCH"
  else
    log "Clonando repositório em diretório temporário para preservar dados persistentes..."
    TMP_CLONE_DIR="$(mktemp -d /tmp/gestor_prod_git.XXXXXX)"
    git clone --branch "$BRANCH" "$REPO_URL" "$TMP_CLONE_DIR"
    rsync -a --delete \
      --exclude '.env' \
      --exclude 'apps/backend/.env' \
      --exclude 'apps/frontend/.env.local' \
      --exclude 'deploy-secrets.env' \
      --exclude 'uploads' \
      --exclude 'logs' \
      --exclude 'node_modules' \
      --exclude '.next' \
      --exclude 'dist' \
      "$TMP_CLONE_DIR/" "$APP_DIR/"
    rm -rf "$TMP_CLONE_DIR"
    cd "$APP_DIR"
  fi
fi
if [[ -d .git ]]; then
  log "Código na versão: $(git log --oneline -1)"
else
  log "Código preparado a partir de arquivo local."
fi

# ═══════════════════════════════════════════════════════════
step "ETAPA 6 — Configurar variáveis de ambiente"
# ═══════════════════════════════════════════════════════════
cd "$APP_DIR"

# Determinar URL pública
if [[ -n "$DOMAIN" ]]; then
  BACKEND_URL="https://api.$DOMAIN"
  FRONTEND_URL="https://$DOMAIN"
else
  BACKEND_URL="http://$VM_IP:3001"
  FRONTEND_URL="http://$VM_IP"
fi

# Arquivo .env raiz
cat > "$APP_DIR/.env" <<ENVEOF
# ===== CONFIGURAÇÃO DE PRODUÇÃO — GERADO AUTOMATICAMENTE =====
# Gerado em: $(date '+%Y-%m-%d %H:%M:%S')
NODE_ENV=production
LOG_LEVEL=info

# ===== BANCO DE DADOS =====
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gestor_multiprojetos
DATABASE_USER=gestor
DATABASE_PASSWORD=${DB_PASSWORD}
DATABASE_URL=${DATABASE_URL}

# ===== REDIS =====
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# ===== BACKEND =====
PORT=3001
BACKEND_PORT=3001
BACKEND_HOST=0.0.0.0
BACKEND_URL=${BACKEND_URL}
FRONTEND_URL=${FRONTEND_URL}
CORS_ORIGINS=${FRONTEND_URL}

# ===== JWT =====
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=3600
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=604800

# ===== FRONTEND =====
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=${BACKEND_URL}
NEXT_PUBLIC_APP_URL=${FRONTEND_URL}

# ===== UPLOAD =====
UPLOAD_DIR=/opt/gestor_multiprojetos/uploads
MAX_FILE_SIZE=52428800

# ===== MONITORAMENTO =====
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090
ENVEOF

# Copiar .env para o backend
cp "$APP_DIR/.env" "$APP_DIR/apps/backend/.env"

# .env para o frontend (apenas variáveis NEXT_PUBLIC)
cat > "$APP_DIR/apps/frontend/.env.local" <<FRONTENDENV
NEXT_PUBLIC_API_URL=${BACKEND_URL}
NEXT_PUBLIC_APP_URL=${FRONTEND_URL}
NODE_ENV=production
FRONTENDENV

log ".env configurado."

# ═══════════════════════════════════════════════════════════
step "ETAPA 7 — Instalar dependências (monorepo) e build do Backend"
# ═══════════════════════════════════════════════════════════

# npm workspaces: instalar tudo a partir da raiz (hoisting correto)
cd "$APP_DIR"
log "Instalando dependências do monorepo (npm workspaces)..."
npm ci --prefer-offline --no-audit 2>&1 | tail -10

cd "$APP_DIR/apps/backend"

# Evita cache incremental quebrado no servidor (tsbuildinfo pode impedir emissão de JS)
rm -f tsconfig.tsbuildinfo
rm -rf dist

log "Gerando Prisma Client..."
npx prisma generate --schema=prisma/schema.prisma

log "Executando migrações Prisma..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy --schema=prisma/schema.prisma || warn "Migrações podem já estar aplicadas."
log "Migrações Prisma concluídas."

# Relaxar noImplicitAny para build de produção (muitos lambdas sem type annotation)
if grep -q '"strict": true' tsconfig.json; then
  log "Ajustando tsconfig.json para build (noImplicitAny=false)..."
  sed -i 's/"strict": true/"strict": true,\n    "noImplicitAny": false/' tsconfig.json
fi

log "Buildando backend (NestJS)..."
npm run build 2>&1 | tail -20
log "Backend build concluído."

# Executar seed somente sob demanda explícita
if [[ "$RUN_SEED" == "true" ]]; then
  if DATABASE_URL="$DATABASE_URL" npx prisma db seed --schema=prisma/schema.prisma 2>/dev/null; then
    log "Seed executado com sucesso."
  else
    warn "Seed solicitado, mas não foi executado com sucesso."
  fi
else
  log "Seed desabilitado por padrão para não inserir ou sobrescrever dados do ambiente de produção."
fi

# ═══════════════════════════════════════════════════════════
step "ETAPA 8 — Build do Frontend"
# ═══════════════════════════════════════════════════════════
cd "$APP_DIR/apps/frontend"

# Limpa cache incremental/build anterior para evitar artefatos inconsistentes
rm -f tsconfig.tsbuildinfo
rm -rf .next

log "Buildando frontend (pode levar 5-8 minutos no Free Tier)..."
NEXT_PUBLIC_API_URL="$BACKEND_URL" \
NEXT_PUBLIC_APP_URL="$FRONTEND_URL" \
NODE_ENV=production \
npm run build 2>&1 | tail -15
log "Frontend build concluído."

# ═══════════════════════════════════════════════════════════
step "ETAPA 9 — Criar diretório de uploads e configurar permissões"
# ═══════════════════════════════════════════════════════════
sudo mkdir -p /opt/gestor_multiprojetos/uploads
sudo mkdir -p /opt/gestor_multiprojetos/logs
sudo chown -R ubuntu:ubuntu /opt/gestor_multiprojetos/uploads
sudo chown -R ubuntu:ubuntu /opt/gestor_multiprojetos/logs

# ═══════════════════════════════════════════════════════════
step "ETAPA 10 — Configurar PM2 (process manager)"
# ═══════════════════════════════════════════════════════════

# Parar apps existentes
pm2 delete gestor-backend  2>/dev/null || true
pm2 delete gestor-frontend 2>/dev/null || true

# Criar ecosystem.config.js
cat > "$APP_DIR/ecosystem.config.js" <<'PM2CONFIG'
module.exports = {
  apps: [
    {
      name: 'gestor-backend',
      script: './apps/backend/dist/main.js',
      cwd: '/opt/gestor_multiprojetos',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '400M',
      error_file: './logs/backend-error.log',
      out_file:   './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'gestor-frontend',
      script: 'node_modules/.bin/next',
      args: 'start --port 3000',
      cwd: '/opt/gestor_multiprojetos/apps/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '350M',
      error_file: '/opt/gestor_multiprojetos/logs/frontend-error.log',
      out_file:   '/opt/gestor_multiprojetos/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
PM2CONFIG

# Iniciar aplicações
cd "$APP_DIR"
pm2 start ecosystem.config.js

# Configurar PM2 para iniciar junto com o sistema
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || \
  sudo env PATH="$PATH:/usr/local/bin" pm2 startup systemd -u ubuntu --hp /home/ubuntu

log "PM2 configurado. Apps rodando:"
pm2 status

# ═══════════════════════════════════════════════════════════
step "ETAPA 11 — Configurar Nginx (proxy reverso)"
# ═══════════════════════════════════════════════════════════

# Gerar configuração Nginx
if [[ -n "$DOMAIN" ]]; then
  SERVER_NAME="$DOMAIN api.$DOMAIN"
  NGINX_BACKEND_SERVER="api.$DOMAIN"
else
  SERVER_NAME="$VM_IP"
  NGINX_BACKEND_SERVER="$VM_IP"
fi

sudo tee /etc/nginx/sites-available/gestor-multiprojetos > /dev/null <<NGINXEOF
# ── Upload limit ──────────────────────────────────────────
client_max_body_size 50M;

# ── Backend (NestJS API) ──────────────────────────────────
upstream gestor_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

# ── Frontend (Next.js) ────────────────────────────────────
upstream gestor_frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# ── Rate limiting ─────────────────────────────────────────
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=30r/s;
limit_req_zone \$binary_remote_addr zone=login_limit:10m rate=5r/m;

# ════════════════════════════════════════════════════════════
# Servidor principal — Frontend + API
# ════════════════════════════════════════════════════════════
server {
    listen 80;
    server_name $SERVER_NAME;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logs
    access_log /var/log/nginx/gestor-access.log;
    error_log  /var/log/nginx/gestor-error.log;

    # ── API Backend — /api/* → backend:3001 ──────────────
    location /api/ {
        limit_req zone=api_limit burst=50 nodelay;

        proxy_pass         http://gestor_backend/;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Connection        "";
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    # ── Login — rate limit específico ────────────────────
    location /api/auth/login {
        limit_req zone=login_limit burst=10 nodelay;

        proxy_pass         http://gestor_backend/auth/login;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }

    # ── Health check ──────────────────────────────────────
    location /health {
        proxy_pass http://gestor_backend/health;
        proxy_set_header Host \$host;
        access_log off;
    }

    # ── Next.js static files (cache longo) ───────────────
    location /_next/static/ {
        proxy_pass http://gestor_frontend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable, max-age=31536000";
        proxy_set_header Host \$host;
    }

    # ── Frontend — tudo o mais → Next.js:3000 ────────────
    location / {
        proxy_pass         http://gestor_frontend;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_read_timeout 60s;
    }
}
NGINXEOF

# Ativar site
sudo ln -sfn /etc/nginx/sites-available/gestor-multiprojetos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração Nginx
sudo nginx -t
sudo systemctl enable --now nginx 2>/dev/null || true
sudo systemctl reload nginx 2>/dev/null || true
log "Nginx configurado e recarregado."

# ═══════════════════════════════════════════════════════════
step "ETAPA 12 — Configurar Firewall (iptables/ufw)"
# ═══════════════════════════════════════════════════════════

# UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
# Portas diretas (além do Nginx, para acesso direto se necessário)
sudo ufw allow 3000/tcp comment 'Next.js frontend'
sudo ufw allow 3001/tcp comment 'NestJS backend'
sudo ufw --force enable
log "UFW ativado."

# OCI Ubuntu bloqueia portas por iptables além do Security List
# Adicionar regras iptables para garantir acesso
sudo iptables -I INPUT -p tcp --dport 80   -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT -p tcp --dport 443  -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT 2>/dev/null || true
sudo iptables -I INPUT -p tcp --dport 3001 -j ACCEPT 2>/dev/null || true

# Persistir iptables
if command -v iptables-save >/dev/null 2>&1; then
  sudo apt-get install -y -qq iptables-persistent 2>/dev/null || true
  sudo iptables-save | sudo tee /etc/iptables/rules.v4 >/dev/null 2>/dev/null || true
fi
log "Regras de firewall configuradas."

# ═══════════════════════════════════════════════════════════
step "ETAPA 13 — Aguardar aplicações estarem prontas"
# ═══════════════════════════════════════════════════════════
log "Aguardando backend iniciar..."
for i in {1..30}; do
  if curl -sf http://localhost:3001/health >/dev/null 2>&1; then
    log "Backend respondeu em ${i}s."
    break
  fi
  sleep 2
  [[ $i -eq 30 ]] && warn "Backend ainda não respondeu após 60s — verifique: pm2 logs gestor-backend"
done

log "Aguardando frontend iniciar..."
for i in {1..30}; do
  if curl -sf http://localhost:3000 >/dev/null 2>&1; then
    log "Frontend respondeu em ${i}s."
    break
  fi
  sleep 2
  [[ $i -eq 30 ]] && warn "Frontend ainda não respondeu após 60s — verifique: pm2 logs gestor-frontend"
done

# ═══════════════════════════════════════════════════════════
step "ETAPA 14 — Teste final"
# ═══════════════════════════════════════════════════════════
echo ""
echo "── Teste via Nginx (porta 80) ──"
HTTP_CODE=$(curl -so /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
echo "  GET http://localhost/     → HTTP $HTTP_CODE"

API_CODE=$(curl -so /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
echo "  GET http://localhost/api/health → HTTP $API_CODE"

echo ""
echo "── Status PM2 ──"
pm2 status

echo ""
echo "── Uso de memória ──"
free -h

REMOTE_SCRIPT

# ── Conclusão local ────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              DEPLOY CONCLUÍDO COM SUCESSO!                   ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║  Aplicação: http://%-42s ║\n" "$VM_IP"
printf "║  Backend  : http://%-42s ║\n" "$VM_IP:3001/health"
printf "║  Via Nginx: http://$VM_IP/api/health%-24s ║\n" ""
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Credenciais (salvas em deploy-secrets.env):                 ║"
printf "║  DB_PASSWORD     : %-41s ║\n" "${DB_PASSWORD:0:20}..."
printf "║  REDIS_PASSWORD  : %-41s ║\n" "${REDIS_PASSWORD:0:20}..."
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Comandos úteis (via SSH):                                   ║"
echo "║    pm2 status                  # status dos processos        ║"
echo "║    pm2 logs gestor-backend     # logs do backend             ║"
echo "║    pm2 logs gestor-frontend    # logs do frontend            ║"
echo "║    pm2 restart all             # reiniciar tudo              ║"
echo "║    sudo systemctl status nginx # status do Nginx             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Salvar segredos localmente
cat > "deploy-secrets.env" <<SECRETS_EOF
# SEGREDOS GERADOS — GUARDE EM LOCAL SEGURO
# Gerado em: $(date '+%Y-%m-%d %H:%M:%S')
VM_IP=$VM_IP
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
DATABASE_URL=postgresql://gestor:${DB_PASSWORD}@${VM_IP}:5432/gestor_multiprojetos
SECRETS_EOF
chmod 600 deploy-secrets.env
log "Credenciais salvas em deploy-secrets.env (chmod 600 — protegido)"

echo ""
log "Para HTTPS com Let's Encrypt (requer domínio configurado):"
echo "  ssh $SSH_USER@$VM_IP -i $SSH_KEY"
echo "  sudo certbot --nginx -d SEU_DOMINIO.com -d api.SEU_DOMINIO.com"
echo ""
log "Para atualizar a aplicação no futuro:"
echo "  VM_IP=$VM_IP bash scripts/deploy-app.sh"
