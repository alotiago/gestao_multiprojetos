# Deploy na Oracle Cloud (OCI) — VM + Docker Compose

## 1) Provisionar a VM na OCI

1. Crie uma instância Compute (Ubuntu 22.04 LTS, shape x86_64).
2. Associe IP público.
3. No Security List/NSG, libere entrada:
   - TCP 22 (SSH)
   - TCP 80 (HTTP)
   - TCP 443 (HTTPS)
4. Não exponha 5432 e 6379 para internet.

## 2) Conectar e preparar servidor

```bash
ssh ubuntu@IP_PUBLICO_DA_VM
sudo mkdir -p /opt
sudo chown -R $USER:$USER /opt
```

Copie o repositório para a VM (ou clone por lá) e execute:

```bash
cd /opt/gestor_multiprojetos
chmod +x deploy/oci/setup_vm.sh
./deploy/oci/setup_vm.sh
```

Depois, encerre e abra a sessão SSH novamente para aplicar o grupo docker.

## 3) Configurar variáveis de produção

```bash
cd /opt/gestor_multiprojetos
cp deploy/oci/.env.oci.example .env
nano .env
```

Preencha obrigatoriamente:
- `DATABASE_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL` (ex.: https://app.seudominio.com)
- `NEXT_PUBLIC_API_URL` (ex.: https://api.seudominio.com)

Para gerar secrets JWT:

```bash
openssl rand -base64 64
```

## 4) Deploy da aplicação

Se o projeto já estiver clonado em `/opt/gestor_multiprojetos`:

```bash
cd /opt/gestor_multiprojetos
chmod +x deploy/oci/deploy.sh
./deploy/oci/deploy.sh --branch main --env-file .env
```

Se quiser que o script clone o repositório automaticamente:

```bash
./deploy/oci/deploy.sh \
  --repo-url URL_DO_REPOSITORIO \
  --project-dir /opt/gestor_multiprojetos \
  --branch main \
  --env-file .env
```

O script faz:
- pull/clone da branch
- `docker compose up -d --build`
- `prisma migrate deploy`
- healthcheck de backend e frontend

## 5) DNS e HTTPS (Nginx + Let’s Encrypt)

Crie os registros DNS:
- `app.seudominio.com` -> IP público da VM
- `api.seudominio.com` -> IP público da VM

Depois configure proxy + SSL:

```bash
cd /opt/gestor_multiprojetos
chmod +x deploy/oci/setup_nginx_ssl.sh
./deploy/oci/setup_nginx_ssl.sh \
  --app-domain app.seudominio.com \
  --api-domain api.seudominio.com \
  --email seu-email@dominio.com
```

## 6) Validação final

```bash
docker compose -f docker-compose.prod.yml ps
curl -I https://app.seudominio.com
curl https://api.seudominio.com/health
```

## 7) Atualizações futuras

A cada nova versão:

```bash
cd /opt/gestor_multiprojetos
./deploy/oci/deploy.sh --branch main --env-file .env
```

## 8) Rollback rápido

```bash
cd /opt/gestor_multiprojetos
git checkout TAG_OU_COMMIT_ANTERIOR
./deploy/oci/deploy.sh --branch $(git branch --show-current) --env-file .env --build-no-cache
```
