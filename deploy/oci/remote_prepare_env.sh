#!/usr/bin/env bash
# remote_prepare_env.sh — Gera .env de producao para o Gestor de Multiprojetos
# Uso: APP_DIR=/opt/gestor_multiprojetos DOMAIN=gestaodeprojetos.oais.cloud bash remote_prepare_env.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/gestor_multiprojetos}"
DOMAIN="${DOMAIN:-gestaodeprojetos.oais.cloud}"

gen() { openssl rand -base64 48 | tr -d '\n/+=' | head -c 64; }

mkdir -p "${APP_DIR}"

cat > "${APP_DIR}/.env" <<ENVEOF
# Gerado automaticamente em $(date '+%Y-%m-%d %H:%M:%S')
# NÃO commite este arquivo no git

NODE_ENV=production

# Banco de Dados
DATABASE_NAME=gestor_multiprojetos
DATABASE_USER=gestor
DATABASE_PASSWORD=$(gen)

# Redis
REDIS_PASSWORD=$(gen)

# JWT
JWT_SECRET=$(gen)
JWT_REFRESH_SECRET=$(gen)
JWT_EXPIRATION=1h

# URLs públicas (domínio de produção)
DOMAIN=${DOMAIN}
FRONTEND_URL=https://${DOMAIN}
BACKEND_URL=https://${DOMAIN}/api
CORS_ORIGINS=https://${DOMAIN}
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api

# Configurações de Upload
MAX_FILE_SIZE=52428800
ENVEOF

chmod 600 "${APP_DIR}/.env"
echo "✅ .env gerado com sucesso em ${APP_DIR}/.env"
