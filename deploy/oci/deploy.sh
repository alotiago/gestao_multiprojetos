#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/opt/gestor_multiprojetos"
BRANCH="main"
REPO_URL=""
ENV_FILE=".env"
COMPOSE_FILE="docker-compose.prod.yml"
BUILD_NO_CACHE="false"
RUN_SEED="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-dir) PROJECT_DIR="$2"; shift 2 ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --repo-url) REPO_URL="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --compose-file) COMPOSE_FILE="$2"; shift 2 ;;
    --build-no-cache) BUILD_NO_CACHE="true"; shift ;;
    --seed) RUN_SEED="true"; shift ;;
    *)
      echo "Parâmetro inválido: $1"
      echo "Uso: $0 [--repo-url URL] [--project-dir DIR] [--branch BRANCH] [--env-file ARQ] [--compose-file ARQ] [--build-no-cache] [--seed]"
      exit 1
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker não encontrado. Execute deploy/oci/setup_vm.sh antes."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "Docker Compose não encontrado."
  exit 1
fi

if [[ -d "$PROJECT_DIR/.git" ]]; then
  git -C "$PROJECT_DIR" fetch --all --prune
  git -C "$PROJECT_DIR" checkout "$BRANCH"
  git -C "$PROJECT_DIR" pull --ff-only origin "$BRANCH"
else
  if [[ -z "$REPO_URL" ]]; then
    echo "Projeto não encontrado em $PROJECT_DIR. Informe --repo-url para clonar."
    exit 1
  fi
  git clone --branch "$BRANCH" "$REPO_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo de ambiente não encontrado: $ENV_FILE"
  echo "Exemplo: cp deploy/oci/.env.oci.example .env"
  exit 1
fi

if [[ "$ENV_FILE" != ".env" ]]; then
  cp "$ENV_FILE" .env
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Compose não encontrado: $COMPOSE_FILE"
  exit 1
fi

if [[ "$BUILD_NO_CACHE" == "true" ]]; then
  $COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache
  $COMPOSE_CMD -f "$COMPOSE_FILE" up -d
else
  $COMPOSE_CMD -f "$COMPOSE_FILE" up -d --build
fi

docker exec gestor_backend sh -lc "cd /app/apps/backend && npx prisma migrate deploy --schema=prisma/schema.prisma"

if [[ "$RUN_SEED" == "true" ]]; then
  docker exec gestor_backend sh -lc "cd /app/apps/backend && npx prisma db seed --schema=prisma/schema.prisma" || true
fi

sleep 5

if curl -fsS http://localhost:3001/health >/dev/null; then
  echo "Backend OK: http://localhost:3001/health"
else
  echo "Backend não respondeu no healthcheck"
  exit 1
fi

if curl -fsS -I http://localhost:3000 >/dev/null; then
  echo "Frontend OK: http://localhost:3000"
else
  echo "Frontend não respondeu"
  exit 1
fi

$COMPOSE_CMD -f "$COMPOSE_FILE" ps

echo "Deploy concluído com sucesso."
