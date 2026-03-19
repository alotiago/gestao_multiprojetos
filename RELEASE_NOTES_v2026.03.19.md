# Release Notes - v2026.03.19

Data: 2026-03-19
Tag: `v2026.03.19`
Branch: `master`

## Resumo
Esta release publica a automacao completa de deploy OCI do Gestor Multiprojetos em arquitetura multi-app na VM `10.10.11.92`, com gateway nginx no host, correcoes de build do frontend para API URL de producao e runbook operacional para futuras versoes.

## Commits incluidos
- `bf9397a` - `feat(deploy): add OCI multi-app deployment automation`
- `ce70c38` - `fix(frontend): bake NEXT_PUBLIC_API_URL in Docker build`
- `ab1e316` - `docs(deploy): add production runbook for VM 10.10.11.92`

## Principais mudancas

### 1) Deploy OCI multi-app (novo)
Arquivos:
- `docker-compose.oci.yml`
- `deploy/oci/full_deploy_vm.sh`
- `deploy/oci/setup_host_nginx.sh`
- `deploy/oci/remote_prepare_env.sh`
- `deploy/oci/nginx-gmp.conf`
- `deploy/oci/seed-users.js`
- `deploy/oci/host-gaa.conf`
- `deploy/oci/host-gmp.conf`

Entregas tecnicas:
- Stack GMP com postgres/redis/backend/frontend/nginx interno em `127.0.0.1:8081`.
- Gateway nginx host roteando por dominio para GAA (`127.0.0.1:8080`) e GMP (`127.0.0.1:8081`).
- Script de primeiro deploy com migrate Prisma e fallback de seed em Node.js.
- Ajustes para cenarios com edge TLS termination (`certbot --no-redirect`).

### 2) Frontend - API URL em build time
Arquivo:
- `apps/frontend/Dockerfile`

Entregas tecnicas:
- Adicao de `ARG/ENV NEXT_PUBLIC_API_URL` antes do build do Next.js.
- Evita frontend apontando para endpoint incorreto em producao.

### 3) Documentacao operacional
Arquivos:
- `deploy/oci/RUNBOOK_PROD_10.10.11.92.md`
- `DEPLOY_OCI_VM_FREETIER.md`

Entregas tecnicas:
- Runbook dedicado ao ambiente real de producao (`10.10.11.92`).
- Procedimentos de deploy, update, seed, validacao e troubleshooting.
- Link de referencia no guia legado para reduzir erro operacional.

## Validacao executada
- Containers GMP e GAA ativos e saudaveis no host.
- Validacao local por dominio no host nginx:
  - `curl http://127.0.0.1/health -H 'Host: apoioarquivistico.oais.cloud'` -> `200`
  - `curl http://127.0.0.1/health -H 'Host: gestaodeprojetos.oais.cloud'` -> `200`
- Frontend externo GMP:
  - `https://gestaodeprojetos.oais.cloud/` -> `HTTP 200`
- Seed executado com fallback JS:
  - Resultado: `SEED_OK users=6`

## Observacao importante
Neste ambiente existe borda/proxy externo com TLS termination. Em alguns testes, `/health` externo retornou erro `500` com `Error id ...` na borda, apesar de os servicos internos estarem saudaveis. A fonte de verdade operacional e a validacao local no host/nginx e nos endpoints internos.

## Impacto e risco
- Impacto: alto ganho de repetibilidade de deploy e reducao de tempo de recuperacao.
- Risco residual: dependencia de comportamento da borda externa para healthchecks publicos.

## Proximos passos sugeridos
- Padronizar monitoramento usando healthcheck local no host como criterio de disponibilidade.
- Publicar este texto em GitHub Releases para a tag `v2026.03.19`.
