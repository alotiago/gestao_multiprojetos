# ==============================================================================
# Resumo do Deploy na OCI
# ==============================================================================

## 📋 Checklist Rápido

- [ ] Passo 1: Executar setup interativo
- [ ] Passo 2: Build e push das imagens
- [ ] Passo 3: Provisionar recursos na OCI
- [ ] Passo 4: Deploy do container/K8s
- [ ] Passo 5: Configurar load balancer
- [ ] Passo 6: Habilitar CI/CD
- [ ] Passo 7: Configurar backups

---

## 🚀 Passo 1: Setup Interativo (LOCAL)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\oci-setup-interactive.ps1
```

**Outputs esperados:**
- `~/.oci/config` — Credenciais OCI configuradas
- `.env.oci` — Variáveis de ambiente

### Alternativa Linux (bash)

Se o deploy for a partir de host Linux, use o setup automatizado da OCI CLI:

```bash
chmod +x deploy/oci/setup_oci_cli_linux.sh
./deploy/oci/setup_oci_cli_linux.sh
```

Guia completo:

`deploy/oci/OCI_CLI_LINUX_SETUP.md`

---

## 🐳 Passo 2: Build e Push (LOCAL)

```powershell
# Escolha um tipo de deployment:
# 1 = Container Instances (mais simples)
# 2 = OKE (Kubernetes, mais complexo)
# 3 = Compute VM (tradicional)

.\oci-deploy.ps1 -DeploymentType container-instances
```

**O script vai:**
1. Fazer build: `docker build -t gestor-backend:latest ...`
2. Fazer push: `docker push sa-saopaulo-1.ocir.io/{namespace}/gestor-backend:latest`
3. Gerar manifestos (se OKE)
4. Mostrar próximas instruções

---

## ☁️ Passo 3: Recursos na OCI (CONSOLE)

### 3.1 - Criar VCN (Virtual Cloud Network)
```powershell
oci network vcn create \
  --cidr-block 10.0.0.0/16 \
  --display-name gestor-vcn \
  --compartment-id <COMPARTMENT_ID>
```

### 3.2 - Criar Subnet Pública
```powershell
oci network subnet create \
  --vcn-id <VCN_ID> \
  --cidr-block 10.0.1.0/24 \
  --display-name gestor-subnet-public \
  --compartment-id <COMPARTMENT_ID>
```

### 3.3 - Criar Banco de Dados PostgreSQL
```powershell
oci mysql db-system create \
  --display-name gestor-postgres \
  --admin-user-name admin \
  --admin-password <PASSWORD> \
  --db-name gestor_multiprojetos \
  --compartment-id <COMPARTMENT_ID>
```

**Esperar 15-20 minutos...** ⏳

### 3.4 - Criar Cache Redis (Opcional)
```powershell
oci cache redis-cluster create \
  --display-name gestor-redis \
  --node-count 1 \
  --node-shape VM.Standard.E4.Flex \
  --compartment-id <COMPARTMENT_ID>
```

---

## 🎯 Passo 4: Deploy (Escolha uma opção)

### Opção A: Container Instances

**Via Console OCI:**

1. **Compute → Container Instances → Create**
2. **Preencher:**
   - Display Name: `gestor-backend`
   - Image: `sa-saopaulo-1.ocir.io/{namespace}/gestor-backend:latest`
   - Shape: `VM.Standard.E4.Flex (2 OCPUs, 2 GB)`
   - Port: `3001`
   - Volumes: Montar `/app/uploads`

3. **Repetir para frontend (porta 3000)**

### Opção B: OKE (Kubernetes)

```powershell
# 1. Criar cluster
oci ce cluster create \
  --name gestor-cluster \
  --kubernetes-version v1.28.0 \
  --compute-shape VM.Standard.E4.Flex \
  --node-count 3

# 2. Configurar kubectl
oci ce cluster create-kubeconfig \
  --cluster-id <CLUSTER_ID> \
  --file ~/.kube/config

# 3. Deploy backend
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gestor-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gestor-backend
  template:
    metadata:
      labels:
        app: gestor-backend
    spec:
      containers:
      - name: backend
        image: sa-saopaulo-1.ocir.io/{namespace}/gestor-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-config
              key: url
        - name: REDIS_HOST
          value: redis-service
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
EOF

# 4. Deploy frontend
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gestor-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gestor-frontend
  template:
    metadata:
      labels:
        app: gestor-frontend
    spec:
      containers:
      - name: frontend
        image: sa-saopaulo-1.ocir.io/{namespace}/gestor-frontend:latest
        ports:
        - containerPort: 3000
EOF

# 5. Criar Service (Load Balancer)
kubectl expose deployment gestor-backend \
  --type=LoadBalancer \
  --name=gestor-api-lb \
  --port=443 \
  --target-port=3001
```

### Opção C: Compute VM

```bash
# 1. SSH na máquina
ssh -i seu-chave.key ubuntu@seu-ip-da-vm

# 2. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. Clone repositório (com credenciais)
git clone https://seu-usuario:seu-token@github.com/seu-repo.git

# 4. Setup ambiente
cd gestor_multiprojetos
cp .env.production.example .env.production
# Editar .env.production com valores reais

# 5. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 6. Verificar status
docker-compose ps
docker-compose logs -f backend
```

---

## 🌐 Passo 5: Load Balancer & DNS

### 5.1 - Network Load Balancer

```powershell
# Criar NLB
oci nlb network-load-balancer create \
  --display-name gestor-nlb \
  --subnet-id <SUBNET_ID> \
  --compartment-id <COMPARTMENT_ID>

# Criar backend set para API (porta 3001)
oci nlb backend-set create \
  --network-load-balancer-id <NLB_ID> \
  --name backend-api \
  --health-checker-protocol TCP \
  --health-checker-port 3001

# Criar listener
oci nlb listener create \
  --network-load-balancer-id <NLB_ID> \
  --name listener-api \
  --default-backend-set-name backend-api \
  --port 443 \
  --protocol TCP
```

### 5.2 - DNS

```powershell
# Se usando OCI DNS:
oci dns record rrset update \
  --zone-name seu-dominio.com.br \
  --domain gestor.seu-dominio.com.br \
  --rtype A \
  --items '[{"content":"<IP_DO_NLB>"}]'

# Ou manualmente no seu provedor DNS:
# gestor.seu-dominio.com.br → A → <IP_DO_NLB>
# api.seu-dominio.com.br → A → <IP_DO_NLB>
```

---

## 📊 Passo 6: Verificação e Monitoramento

```bash
# Verificar health do backend
curl https://api.seu-dominio.com.br/health

# Ver logs
kubectl logs -f deployment/gestor-backend

# Acessar Grafana
https://grafana.seu-dominio.com.br
# Usuário: admin
# Senha: <GRAFANA_PASSWORD do .env>

# Acessar Prometheus
https://prometheus.seu-dominio.com.br
```

---

## 🔐 Passo 7: Segurança

### Network Security Groups
```powershell
# Criar NSG
oci network nsg create \
  --compartment-id <COMPARTMENT_ID> \
  --vcn-id <VCN_ID> \
  --display-name gestor-nsg

# Regra: Permitir HTTPS entrada
oci network nsg-rules add \
  --nsg-id <NSG_ID> \
  --security-rules '[{"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":443,"max":443}}}]'

# Regra: Permitir HTTP entrada (para redirect)
oci network nsg-rules add \
  --nsg-id <NSG_ID> \
  --security-rules '[{"direction":"INGRESS","protocol":"6","source":"0.0.0.0/0","tcpOptions":{"destinationPortRange":{"min":80,"max":80}}}]'
```

### WAF
```powershell
# Habilitar WAF na aplicação
# Via Console: Security → WAF → Create Web Application Firewall
```

---

## 💾 Backups

```powershell
# Backup PostgreSQL
oci db-backup create \
  --db-system-id <DB_SYSTEM_ID>

# Configurar retenção
oci db-system update \
  --db-system-id <DB_SYSTEM_ID> \
  --backup-retention-period-in-days 30
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| Container não inicia | `kubectl logs deployment/gestor-backend` |
| Conexão recusada | Verificar Network Security Groups |
| Banco não responde | Verificar endpoint PostgreSQL e credenciais |
| Imagem não encontrada | Verificar repositório OCIR e credentials |
| DNS não resolve | Esperar propagação ou verificar registros |

---

## 📈 Custos Estimados (Mensais)

| Recurso | Custo |
|---------|-------|
| 3x VM (Container Instances) | $35 |
| PostgreSQL Managed | $50 |
| Redis | $20 |
| Load Balancer | $15 |
| Monitoring (Prometheus) | $5 |
| Data Transfer (egress) | $10 |
| **TOTAL** | **~$135/mês** |

---

## ✅ Próximos Passos

1. **Crie um arquivo `.env.production`** com base em `.env.production.example`
2. **Execute `oci-setup-interactive.ps1`** para configurar credenciais
3. **Execute `oci-deploy.ps1`** para fazer build/push das imagens
4. **Crie os recursos** seguindo o Passo 3 acima
5. **Deploy a aplicação** escolhendo uma das 3 opções (Container/OKE/Compute)
6. **Teste em https://seu-dominio.com.br**

---

**Documentação oficial:** [https://docs.oracle.com/en-us/iaas/](https://docs.oracle.com/en-us/iaas/)
