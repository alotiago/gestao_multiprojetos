# Guia de Deploy: Gestor Multiprojetos na OCI

## 📋 Pré-requisitos

- [ x]
-  Conta Oracle Cloud Infrastructure (OCI) ativa
- [ x] Docker Desktop instalado ([https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop))
- [ x] OCI CLI instalado ([https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm))
- [ x] Credenciais OCI (Tenancy ID, User ID, Fingerprint, Private Key)

---

## 🚀 Passo 1: Executar Setup Interativo

```powershell
# No PowerShell, no diretório do projeto
.\oci-setup-interactive.ps1
```

Este script vai:
1. Coletar suas credenciais OCI
2. Validar a conexão
3. Criar arquivo de configuração em `~/.oci/config`
4. Gerar `.env.oci` com variáveis de ambiente

**Informações que você vai precisar:**
- **Tenancy ID**: `ocid1.tenancy.oc1..aaaaaaaxxxxxxxx`
- **User ID**: `ocid1.user.oc1..aaaaaaaaxxxxxxxx`
- **Fingerprint**: `aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99`
- **Region**: `sa-saopaulo-1` (ou outra região disponível)
- **Private Key Path**: Caminho para seu arquivo `oci_api_key.pem`
- **OCIR Namespace** e **Username**

---

## 🐳 Passo 2: Fazer Build e Push das Imagens

```powershell
.\oci-deploy.ps1 -DeploymentType container-instances
```

Ou escolha seu tipo de deployment:
- `container-instances` - Simples, sem orquestração
- `oke` - Kubernetes (mais escalável)
- `compute` - Máquina virtual tradicional

Este script vai:
1. ✓ Verificar pré-requisitos (Docker, OCI CLI)
2. ✓ Fazer build das imagens (backend + frontend)
3. ✓ Fazer login no OCIR
4. ✓ Push das imagens para seu registry
5. ✓ Gerar manifestos Kubernetes (se usar OKE)

---

## ☁️ Passo 3: Deploy no OCI (por tipo)

### Opção A: Container Instances (Recomendado para começar)

1. Vá ao [OCI Console](https://cloud.oracle.com/)
2. Navegue para **Compute > Container Instances**
3. Clique em **Create container instance**

**Para o Backend:**
```
Display Name: gestor-multiprojetos-backend
Image: <seu-registry>/gestor-backend:latest
CPU: 1
Memory: 2 GB
Port: 3001
Environment Variables:
  DATABASE_HOST: <seu-endpoint-postgres>
  DATABASE_PASSWORD: ***
  REDIS_HOST: <seu-endpoint-redis>
```

**Para o Frontend:**
```
Display Name: gestor-multiprojetos-frontend
Image: <seu-registry>/gestor-frontend:latest
CPU: 1
Memory: 1 GB
Port: 3000
Environment Variables:
  NEXT_PUBLIC_API_URL: https://<seu-dominio>.com.br
```

---

### Opção B: OKE (Kubernetes)

```bash
# 1. Criar cluster (via Console ou CLI)
oci ce cluster create \
  --name gestor-cluster \
  --kubernetes-version v1.27.0 \
  --compartment-id <COMPARTMENT_ID>

# 2. Configurar kubectl
oci ce cluster create-kubeconfig \
  --cluster-id <CLUSTER_ID> \
  --file ~/.kube/config \
  --region sa-saopaulo-1

# 3. Criar secrets
kubectl create secret generic gestor-secrets \
  --from-literal=db-password=<PASSWORD>

# 4. Criar configmap
kubectl create configmap gestor-config \
  --from-literal=db-host=<DB_HOST>

# 5. Deploy
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml

# 6. Verificar status
kubectl get svc
kubectl logs deployment/gestor-backend
```

---

### Opção C: Compute Instance

1. Crie uma Compute VM (Ubuntu 22.04 LTS)
2. SSH na máquina
3. Instale Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

4. Setup Docker Compose:
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

5. Deploy:
```bash
git clone <seu-repo>
cd gestor_multiprojetos
docker-compose -f docker-compose.prod.yml up -d
```

---

## 💾 Passo 4: Configurar Banco de Dados

### PostgreSQL Managed Database

1. Vá para **Database > Oracle Database**
2. Clique em **Create Database System**
3. Configure:
   - Shape: VM.Standard.E4.Flex (2 OCPUs, 16 GB)
   - PostgreSQL Version: 14+
   - Database Name: `gestor_multiprojetos`
   - Admin user: `admin`
   - Storage: 100 GB

4. Após criação, anote o endpoint e applique migrações:
```bash
npm run -w apps/backend prisma:deploy
npm run -w apps/backend db:seed
```

### Redis

1. (Opcional) Use Redis Cloud ou implante containerizado
2. Se containerizado, adicione ao docker-compose

---

## 🌐 Passo 5: Configurar Network e DNS

### Network Load Balancer
1. Vá para **Networking > Load Balancers**
2. Crie um novo NLB
3. Configure:
   - Backend Set para port 3001 (API)
   - Backend Set para port 3000 (Frontend)
4. Anotue o IP do NLB

### DNS (se tiver domínio)
1. Vá para **Networking > DNS**
2. Crie uma zona DNS
3. Adicione registros A apontando para o IP do NLB

---

## 📊 Passo 6: Monitoramento

### Habilitar Alarmes e Métricas
```bash
# Verificar saúde do backend
curl https://seu-api.com.br/health

# Logs
kubectl logs deployment/gestor-backend -f

# Métricas
oci monitoring metric-data summarize-metrics-data \
  --namespace-name oci_computeagent \
  --query-text 'INSTANCE_CPU_UTILIZATION{instance_id="<INSTANCE_ID>"}'
```

---

## 🔐 Segurança

- [ ] Use Oracle Cloud Vault para secrets
- [ ] Habilite OCI WAF (Web Application Firewall)
- [ ] Configure Network Security Groups (NSGs)
- [ ] Use OCI Identity & Access Management (IAM)
- [ ] Habilite MFA na conta

---

## 💰 Estimativa de Custos

**Container Instances (mínimo):**
- 2x Container Instances (1 OCPU, 2GB cada): ~$20/mês
- PostgreSQL Single Node: ~$50/mês
- Load Balancer: ~$10/mês
- **Total: ~$80/mês**

**Mais detalhes:** [Pricing Calculator](https://www.oracle.com/cloud/price-list/)

---

## 🆘 Troubleshooting

### Erro: "Unexpected end of form" no upload
```
Solução: Verifique se está usando a versão corrigida do frontend
```

### Container não conecta ao banco
```
Verifique:
- Database host/port corretos
- Network Security Group permite conexão
- Credenciais no .env estão corretas
```

### Imagens não fazem push para OCIR
```
docker login sa-saopaulo-1.ocir.io -u <namespace>/<username>
# Use seu Auth Token como senha
```

---

## 📚 Recursos Úteis

- [OCI Documentação Oficial](https://docs.oracle.com/en-us/iaas/)
- [OCI CLI Reference](https://docs.oracle.com/en-us/iaas/tools/oci-cli/latest/)
- [OCI Container Engine for Kubernetes](https://docs.oracle.com/en-us/iaas/Content/ContEng/Concepts/contengoverview.htm)
- [OCI Managed PostgreSQL](https://www.oracle.com/cloud/open-source/postgresql/)

---

## ✅ Checklist Final

- [ ] Credenciais OCI configuradas
- [ ] Docker images built e pushed
- [ ] Database provisioned e migrado
- [ ] Container/Kubernetes deployments ativos
- [ ] Load Balancer configurado
- [ ] DNS apontando para API
- [ ] Monitoramento habilitado
- [ ] Backups configurados
- [ ] HTTPS/SSL habilitado

---

**Pronto para produção! 🚀**
