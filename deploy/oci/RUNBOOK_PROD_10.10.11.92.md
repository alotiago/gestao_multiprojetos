# Runbook de Deploy - Producao VM 10.10.11.92

## Escopo
Este runbook cobre o deploy do **Gestor Multiprojetos** na VM `10.10.11.92`, convivendo com a aplicacao **Gestao de Apoio Arquivistico (GAA)** na mesma maquina.

## Arquitetura final
- `apoioarquivistico.oais.cloud` -> host nginx -> `127.0.0.1:8080` (container nginx do GAA)
- `gestaodeprojetos.oais.cloud` -> host nginx -> `127.0.0.1:8081` (container nginx do GMP)
- GMP stack (docker): `gmp-postgres`, `gmp-redis`, `gmp-backend`, `gmp-frontend`, `gmp-nginx`
- Compose GMP: `docker-compose.oci.yml`

## Pre-requisitos
- Repositorios no servidor:
  - GAA em `/opt/gestao_de_apoio_arquivistico`
  - GMP em `/opt/gestor_multiprojetos`
- DNS dos dominios apontando para a borda/NAT correta.
- Docker Compose funcional no servidor.

## Primeiro deploy do GMP
```bash
cd /opt
sudo git clone -b master https://github.com/alotiago/gestao_multiprojetos.git gestor_multiprojetos
cd /opt/gestor_multiprojetos
sudo bash deploy/oci/full_deploy_vm.sh \
  --repo-url https://github.com/alotiago/gestao_multiprojetos.git \
  --branch master \
  --domain gestaodeprojetos.oais.cloud
```

## Atualizacao de versao do GMP
```bash
cd /opt/gestor_multiprojetos
sudo git fetch --all --prune
sudo git checkout master
sudo git pull --ff-only origin master
sudo docker compose -f docker-compose.oci.yml up -d --build
sudo docker exec gmp-backend sh -c 'cd /app/apps/backend && npx prisma migrate deploy --schema=prisma/schema.prisma'
```

## Seed inicial de usuarios
No runtime de producao, o `ts-node` pode nao existir. Use fallback JS:
```bash
cd /opt/gestor_multiprojetos
sudo docker cp deploy/oci/seed-users.js gmp-backend:/app/apps/backend/seed-users.js
sudo docker exec gmp-backend sh -c 'cd /app/apps/backend && node seed-users.js'
```

Credenciais iniciais:
- `admin@sistema.com / Admin123!`

## Gateway host nginx (multi-app)
Executar uma vez (ou quando precisar reconstruir gateway):
```bash
sudo bash /opt/gestor_multiprojetos/deploy/oci/setup_host_nginx.sh --email seu-email@dominio.com
```

### Pontos importantes do script
- Instala `certbot` e `python3-certbot-nginx`.
- Migra GAA para `127.0.0.1:8080:80`.
- Recria container nginx do GAA com:
  - `docker compose up -d --no-deps --force-recreate nginx`
- Configura host nginx para os dois dominios.
- Emite certificados sem redirect forcado HTTP->HTTPS (`--no-redirect`).

## Validacao recomendada
### 1) Interno (mais confiavel)
```bash
curl -s http://127.0.0.1:8080/health
curl -s http://127.0.0.1:8081/health
```

### 2) Via host nginx local com Host header
```bash
curl -s http://127.0.0.1/health -H 'Host: apoioarquivistico.oais.cloud'
curl -s http://127.0.0.1/health -H 'Host: gestaodeprojetos.oais.cloud'
```

### 3) Externo
```bash
curl -sk https://apoioarquivistico.oais.cloud/
curl -sk https://gestaodeprojetos.oais.cloud/
```

## Observacao sobre /health externo
Neste ambiente existe uma borda/proxy externo com TLS termination. Dependendo da politica da borda, `https://dominio/health` pode retornar erro externo (500 com `Error id ...`) mesmo com os servicos internos saudaveis.

Quando isso ocorrer, usar como fonte de verdade:
- `curl http://127.0.0.1:8080/health`
- `curl http://127.0.0.1:8081/health`
- `curl http://127.0.0.1/health -H 'Host: <dominio>'`

## Troubleshooting rapido
- Porta 80 ocupada ao subir host nginx:
  - Recriar nginx do GAA para aplicar bind em `127.0.0.1:8080`.
- `prisma db seed` falha com `ts-node ENOENT`:
  - Use `deploy/oci/seed-users.js`.
- Certbot sem plugin nginx:
  - Instalar `python3-certbot-nginx`.
- Frontend chamando API errada:
  - Garantir `NEXT_PUBLIC_API_URL` no build (`apps/frontend/Dockerfile` + compose).
