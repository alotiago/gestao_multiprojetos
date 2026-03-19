# Deploy OCI Free Tier — Gestor Multiprojetos
## Guia Completo: VM + Node.js + PostgreSQL + PM2 + Nginx

> Atualizacao importante: para o ambiente atual em `10.10.11.92` (deploy Docker multi-app com gateway host nginx), consulte `deploy/oci/RUNBOOK_PROD_10.10.11.92.md`.

> **Estratégia:** Uma única VM Free Tier (VM.Standard.E2.1.Micro) rodando
> tudo — backend NestJS, frontend Next.js, PostgreSQL e Redis — sem Docker,
> gerenciado pelo PM2, com Nginx como proxy reverso.

---

## Índice

1. [Pré-requisitos](#1-pré-requisitos)
2. [Registrar chave pública no OCI Console](#2-registrar-chave-pública-no-oci-console)
3. [Criar infraestrutura (create-infra.sh)](#3-criar-infraestrutura)
4. [Fazer deploy da aplicação (deploy-app.sh)](#4-fazer-deploy-da-aplicação)
5. [Arquitetura no Free Tier](#5-arquitetura-no-free-tier)
6. [Nginx — roteamento das rotas](#6-nginx--roteamento-das-rotas)
7. [PM2 — gerenciamento de processos](#7-pm2--gerenciamento-de-processos)
8. [Atualizar a aplicação](#8-atualizar-a-aplicação)
9. [HTTPS com Let's Encrypt](#9-https-com-lets-encrypt)
10. [Teste final](#10-teste-final)
11. [Comandos úteis via SSH](#11-comandos-úteis-via-ssh)
12. [Solução de Problemas](#12-solução-de-problemas)

---

## 1. Pré-requisitos

### Na sua máquina (Windows com Git Bash)

| Requisito | Verificar | Instalar |
|-----------|-----------|---------|
| OCI CLI | `oci --version` | [docs.oracle.com](https://docs.oracle.com/iaas/Content/API/SDKDocs/cliinstall.htm) |
| Git Bash | `bash --version` | Incluído no Git for Windows |
| Python 3 | `python3 --version` | [python.org](https://www.python.org/downloads/) |
| Chave SSH | `ls ~/.ssh/id_rsa.pub` | `ssh-keygen -t rsa -b 4096` |

### Gerar chave SSH (se não tiver)

```bash
# No Git Bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -C "deploy-gestor-oci"
# Pressione Enter para não usar senha (automatizado)
```

### Verificar autenticação OCI

```bash
# No Git Bash
export OCI_CLI_AUTH=api_key
/c/ocienv/Scripts/oci.exe iam region list --output table
```

> Se retornar 401: siga a **Seção 2** para registrar sua chave pública.

---

## 2. Registrar chave pública no OCI Console

Esta etapa é necessária **uma única vez** para autenticar o OCI CLI.

### 2.1 Obter o conteúdo da chave pública

```bash
# No Git Bash
cat ~/.ssh/../.oci/oci_api_key_public.pem
# ou
cat ~/.oci/oci_api_key_public.pem
```

### 2.2 Registrar no OCI Console

1. Acesse: [console.us-phoenix-1.oraclecloud.com](https://console.us-phoenix-1.oraclecloud.com) → região `sa-saopaulo-1`
2. Menu superior direito → clique no ícone de usuário → **"Meu Perfil"**
3. No menu esquerdo → **"API Keys"**
4. Clique em **"Adicionar chave de API"**
5. Selecione **"Colar chave pública"**
6. Cole o conteúdo do arquivo `.pem` (começa com `-----BEGIN PUBLIC KEY-----`)
7. Clique em **"Adicionar"**
8. O OCI mostrará o fingerprint — copie e atualize `~/.oci/config` se necessário

### 2.3 Testar autenticação

```bash
/c/ocienv/Scripts/oci.exe os ns get
# Deve retornar: {"data": "seu_namespace"}
```

---

## 3. Criar Infraestrutura

O script `scripts/create-infra.sh` provisiona automaticamente:

```
VCN (10.0.0.0/16)
  └── Internet Gateway
  └── Route Table (0.0.0.0/0 → IGW)
  └── Security List (portas: 22, 80, 443, 3000, 3001)
  └── Subnet pública (10.0.1.0/24)
        └── VM.Standard.E2.1.Micro
              └── Ubuntu 22.04
              └── IP Público atribuído
```

### Executar

```bash
# No Git Bash — no diretório do projeto
cd /c/des/gestor_multiprojetos

export OCI_COMPARTMENT_ID=ocid1.tenancy.oc1..aaaaaaaasruaiaemo24jjsnz5vwetlgq22uc7n36n6bxhmw7l4coz4bh33kq
export OCI_REGION=sa-saopaulo-1

bash scripts/create-infra.sh
```

### Saída esperada

```
╔═══════════════════════════════════════════════╗
║   Gestor Multiprojetos — OCI Free Tier Setup  ║
╚═══════════════════════════════════════════════╝

[09:00:01] Autenticação OCI OK.
══ 1/9 — Criando Virtual Cloud Network (VCN) ══
[09:00:05] VCN criada: ocid1.vcn.oc1...
...
╔════════════════════════════════════════════════════════╗
║           INFRAESTRUTURA CRIADA COM SUCESSO!           ║
║  IP Público : 140.238.xxx.xxx                          ║
║  IDs salvos : infra-ids.env                            ║
╚════════════════════════════════════════════════════════╝
```

O arquivo `infra-ids.env` será criado com todos os IDs para referência futura.

> **Tempo:** 3–6 minutos

---

## 4. Fazer Deploy da Aplicação

O script `scripts/deploy-app.sh` faz SSH na VM e instala/configura tudo:

| Etapa | O que faz |
|-------|-----------|
| 1 | Atualiza Ubuntu, instala ferramentas base |
| 2 | Instala Node.js 20 + PM2 |
| 3 | Instala PostgreSQL 16, cria DB `gestor_multiprojetos` |
| 4 | Instala Redis 7 com senha e limite de 128MB |
| 5 | Clona repositório git |
| 6 | Cria `.env` com todos os segredos gerados |
| 7 | `npm ci` + `npm run build` no backend |
| 8 | `prisma migrate deploy` |
| 9 | `npm ci` + `npm run build` no frontend |
| 10 | Diretórios de upload/logs |
| 11 | PM2 com `ecosystem.config.js`, startup automático |
| 12 | Nginx configurado como proxy reverso |
| 13 | UFW + iptables configurados |
| 14 | Aguarda aplicações respondem |
| 15 | Teste final |

### Executar

```bash
# Ler o IP criado
source infra-ids.env

# Para repositório público:
export VM_IP=$PUBLIC_IP
export REPO_URL=https://github.com/SEU_USUARIO/gestor_multiprojetos.git

# Para repositório privado (com token GitHub):
export GIT_TOKEN=ghp_xxxxxxxxxxxxxxxxxx
export VM_IP=$PUBLIC_IP
export REPO_URL=https://github.com/SEU_USUARIO/gestor_multiprojetos.git

bash scripts/deploy-app.sh
```

> **Tempo:** 10–20 minutos (o build do Next.js é o mais demorado)

### Saída esperada ao finalizar

```
╔══════════════════════════════════════════════════════════════╗
║              DEPLOY CONCLUÍDO COM SUCESSO!                   ║
║  Aplicação: http://140.238.xxx.xxx                           ║
║  Backend  : http://140.238.xxx.xxx:3001/health               ║
╚══════════════════════════════════════════════════════════════╝
```

As credenciais (senhas DB, Redis, JWT secrets) são salvas em `deploy-secrets.env` na sua máquina local.

---

## 5. Arquitetura no Free Tier

```
Internet
    │
    ▼ porta 80/443
┌─────────────────────────────────────────┐
│  VM.Standard.E2.1.Micro (1 OCPU, 1GB)  │
│  Ubuntu 22.04                           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Nginx (:80 / :443)             │    │
│  │  ├── /api/* → localhost:3001    │    │
│  │  └── /*     → localhost:3000    │    │
│  └─────────────────────────────────┘    │
│           │                   │         │
│  ┌────────▼──────┐   ┌────────▼──────┐ │
│  │ NestJS (:3001)│   │ Next.js(:3000)│ │
│  │   (PM2)       │   │   (PM2)       │ │
│  └───────────────┘   └───────────────┘ │
│           │                             │
│  ┌────────▼──────────────────────────┐ │
│  │  PostgreSQL 16 (:5432)            │ │
│  │  Redis 7 (:6379) [senha+limite]   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Limites de memória (1GB RAM)

| Processo | Limite configurado |
|----------|--------------------|
| NestJS backend | ~400 MB |
| Next.js frontend | ~350 MB |
| PostgreSQL 16 | ~150 MB |
| Redis 7 | 128 MB |
| Nginx + sistema | ~100 MB |
| **Total** | **~1.13 GB** |

> O sistema operacional usa swap para momentos de pico. O script PM2 usa `max_memory_restart` para reiniciar automaticamente se ultrapassar o limite.

---

## 6. Nginx — Roteamento das Rotas

```nginx
# API Backend
/api/*   → http://localhost:3001/   (NestJS)
/health  → http://localhost:3001/health

# Frontend
/*       → http://localhost:3000    (Next.js)
/_next/* → cache de 1 ano (assets estáticos)
```

A request `http://IP/api/projects` chega ao Nginx, que a redireciona para `http://localhost:3001/projects` (remove o prefixo `/api`).

---

## 7. PM2 — Gerenciamento de Processos

O arquivo `ecosystem.config.js` gerado define:

```javascript
// gestor-backend  → apps/backend/dist/main.js (NestJS compilado)
// gestor-frontend → next start --port 3000
```

### Startup automático

```bash
# Configurado automaticamente pelo deploy-app.sh
# A aplicação reinicia automaticamente após reboot da VM
pm2 startup systemd
pm2 save
```

---

## 8. Atualizar a Aplicação

Para fazer update após mudanças no código:

```bash
# Opção 1: Re-executar deploy completo
source infra-ids.env
VM_IP=$PUBLIC_IP bash scripts/deploy-app.sh

# Opção 2: Update manual (mais rápido) via SSH
ssh ubuntu@$PUBLIC_IP

# Na VM:
cd /opt/gestor_multiprojetos
git pull origin main

# Backend
cd apps/backend && npm ci && npm run build && cd ../..
DATABASE_URL=$(grep DATABASE_URL .env | cut -d= -f2-) npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

# Frontend
cd apps/frontend
NEXT_PUBLIC_API_URL=$(grep NEXT_PUBLIC_API_URL ../.env | cut -d= -f2-) npm run build
cd ../..

# Reiniciar processos
pm2 restart all
```

---

## 9. HTTPS com Let's Encrypt

Disponível somente quando você tiver um domínio apontado para o IP da VM.

### Pré-requisito

No seu provedor DNS:
```
A    seudominio.com    → 140.238.xxx.xxx
A    api.seudominio.com → 140.238.xxx.xxx
```

### Execute na VM

```bash
ssh ubuntu@$PUBLIC_IP

# Instalar certificado SSL
sudo certbot --nginx \
  -d seudominio.com \
  -d api.seudominio.com \
  --non-interactive \
  --agree-tos \
  --email seu@email.com

# Renovação automática (já configurada pelo certbot)
sudo certbot renew --dry-run
```

### Atualizar as URLs da aplicação

```bash
# Editar .env na VM
nano /opt/gestor_multiprojetos/.env
# Atualizar:
# BACKEND_URL=https://api.seudominio.com
# FRONTEND_URL=https://seudominio.com
# NEXT_PUBLIC_API_URL=https://api.seudominio.com
# CORS_ORIGINS=https://seudominio.com

# Reconstruir frontend com novas URLs
cd /opt/gestor_multiprojetos/apps/frontend
NEXT_PUBLIC_API_URL=https://api.seudominio.com npm run build
pm2 restart all
```

---

## 10. Teste Final

```bash
# Substituir pelo IP real
IP=140.238.xxx.xxx

# Página inicial (deve retornar HTML do Next.js)
curl -I http://$IP/

# Health check do backend (via Nginx)
curl http://$IP/api/health

# Health check direto no backend
curl http://$IP:3001/health

# Teste de autenticação
curl -X POST http://$IP/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"Admin123!"}'
```

### Resultados esperados

```
HTTP/1.1 200 OK          ← página inicial
{"status":"ok",...}      ← health do backend
{"access_token":"..."}   ← login funcionando
```

---

## 11. Comandos Úteis via SSH

```bash
ssh ubuntu@$IP -i ~/.ssh/id_rsa
```

```bash
# ── PM2 ───────────────────────────────────────────────────
pm2 status                     # Status dos processos
pm2 logs                       # Todos os logs (Ctrl+C para sair)
pm2 logs gestor-backend        # Logs do backend
pm2 logs gestor-frontend       # Logs do frontend
pm2 restart all                # Reiniciar tudo
pm2 restart gestor-backend     # Reiniciar só o backend
pm2 monit                      # Dashboard interativo

# ── Nginx ─────────────────────────────────────────────────
sudo nginx -t                  # Testar configuração
sudo systemctl reload nginx    # Recarregar (sem downtime)
sudo tail -f /var/log/nginx/gestor-access.log
sudo tail -f /var/log/nginx/gestor-error.log

# ── PostgreSQL ─────────────────────────────────────────────
sudo -u postgres psql gestor_multiprojetos
  \dt                          # Listar tabelas
  \q                           # Sair

# ── Redis ─────────────────────────────────────────────────
redis-cli -a $REDIS_PASSWORD ping   # Deve retornar PONG
redis-cli -a $REDIS_PASSWORD info memory

# ── Sistema ───────────────────────────────────────────────
free -h                        # Uso de memória
df -h                          # Uso de disco
htop                           # Monitor de recursos
```

---

## 12. Solução de Problemas

### Erro 502 Bad Gateway no Nginx

```bash
# Backend não está respondendo
pm2 status
pm2 logs gestor-backend --lines 50

# Verificar se o processo está na porta correta
ss -tlnp | grep :3001
curl http://localhost:3001/health
```

### Frontend não carrega

```bash
pm2 logs gestor-frontend --lines 50
curl http://localhost:3000
ss -tlnp | grep :3000
```

### Erro de conexão com banco de dados

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"   # Listar bancos
# Testar conexão
psql "postgresql://gestor:SENHA@localhost:5432/gestor_multiprojetos" -c "SELECT 1"
```

### Porta não acessível externamente

```bash
# Verificar UFW
sudo ufw status verbose

# Verificar iptables (OCI bloqueia por padrão)
sudo iptables -L INPUT -n | grep -E "3000|3001|80"

# Adicionar regras se necessário
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3001 -j ACCEPT

# Verificar Security List no OCI Console:
# Networking → Virtual Cloud Networks → gestor-vcn
#   → Security Lists → gestor-sl → Ingress Rules
```

### Pouca memória (OOM Killer)

```bash
# Ver se PM2 está reiniciando por OOM
pm2 status   # Coluna "restarts" alta indica problema

# Ver logs do sistema
sudo journalctl -k | grep -i "oom\|killed"

# Ajuste: desabilitar Prometheus se necessário
# No .env: PROMETHEUS_ENABLED=false
# pm2 restart gestor-backend
```

### Prisma migrate falha

```bash
cd /opt/gestor_multiprojetos/apps/backend
source /opt/gestor_multiprojetos/.env
npx prisma migrate status --schema=prisma/schema.prisma
npx prisma migrate deploy --schema=prisma/schema.prisma
```

---

## Recursos Free Tier Utilizados

| Recurso | Limite Free Tier | Uso |
|---------|-----------------|-----|
| Compute VM | 2x VM.Standard.E2.1.Micro | 1 VM |
| Boot Volume | 200 GB total | 50 GB |
| Outbound Data Transfer | 10 TB/mês | variável |
| VCN | ilimitado | 1 VCN |
| IP Público Ephemeral | 2 | 1 |

> **Custo: $0/mês** desde que dentro dos limites do Always Free Tier.

---

*Gerado automaticamente para gestor_multiprojetos — 13/03/2026*
