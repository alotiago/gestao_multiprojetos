# ============================================================================
# OCI Deploy Script - Gestor Multiprojetos
# ============================================================================
# Script para fazer deploy do Gestor Multiprojetos na OCI

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("container-instances", "oke", "compute")]
    [string]$DeploymentType = "container-instances",
    
    [Parameter(Mandatory=$false)]
    [string]$env_File = "c:\des\gestor_multiprojetos\.env.oci"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Text)
    Write-Host "`n" -NoNewline
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan -NoNewline
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

# ============================================================================
# INÍCIO DO SCRIPT
# ============================================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║      ✓ Deploy OCI - Gestor Multiprojetos                    ║" -ForegroundColor Cyan
Write-Host "║      Tipo: $DeploymentType" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Validar arquivo .env
if (-not (Test-Path $env_File)) {
    Write-Error-Custom "Arquivo .env não encontrado: $env_File"
    Write-Host "Execute primeiro: .\oci-setup-interactive.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Success "Arquivo .env encontrado: $env_File"

# Carregar variáveis de ambiente
$envContent = Get-Content $env_File
foreach ($line in $envContent) {
    if ($line -match '^([^#=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

Write-Header "PASSO 1: Verificação de Pré-requisitos"

# Verificar Docker
Write-Host "Verificando Docker..." -NoNewline
try {
    $dockerVersion = docker --version
    Write-Success "Docker encontrado: $dockerVersion"
} catch {
    Write-Error-Custom "Docker não está instalado ou não está no PATH"
    exit 1
}

# Verificar OCI CLI
Write-Host "Verificando OCI CLI..." -NoNewline
try {
    $ociVersion = oci --version 2>&1
    Write-Success "OCI CLI encontrado: $ociVersion"
} catch {
    Write-Warning "OCI CLI não está instalado. Download em: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm"
}

write-Host ""
Write-Header "PASSO 2: Build das Imagens Docker"

$projectRoot = "c:\des\gestor_multiprojetos"
Set-Location $projectRoot

Write-Host "Building backend..." -ForegroundColor Cyan
docker build -t gestor-backend:latest -f apps/backend/Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Erro ao fazer build do backend"
    exit 1
}
Write-Success "Backend buildado com sucesso"

Write-Host ""
Write-Host "Building frontend..." -ForegroundColor Cyan
docker build -t gestor-frontend:latest -f apps/frontend/Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Erro ao fazer build do frontend"
    exit 1
}
Write-Success "Frontend buildado com sucesso"

Write-Header "PASSO 3: Pushing para OCIR"

$ocirRegion = $env:OCI_REGION
$ocirNamespace = $env:OCIR_NAMESPACE
$ocirUsername = $env:OCIR_USERNAME
$ocirRegistry = "$ocirRegion.ocir.io"

Write-Host "Registry: $ocirRegistry" -ForegroundColor Cyan
Write-Host "Namespace: $ocirNamespace" -ForegroundColor Cyan
Write-Host ""

# Login no OCIR
Write-Host "Fazendo login no OCIR..." -ForegroundColor Cyan
Write-Host "Use seu OCIR Auth Token quando solicitado" -ForegroundColor Yellow
Write-Host ""
docker login $ocirRegistry -u "$ocirNamespace/$ocirUsername" --password-stdin $env:OCIR_AUTH_TOKEN 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Warning "OCIR login pode ter falhado. Prosseguindo mesmo assim..."
}

# Tag das imagens
$backendImage = "$ocirRegistry/$ocirNamespace/gestor-backend:latest"
$frontendImage = "$ocirRegistry/$ocirNamespace/gestor-frontend:latest"

Write-Host "Tagging backend: $backendImage" -ForegroundColor Cyan
docker tag gestor-backend:latest $backendImage

Write-Host "Tagging frontend: $frontendImage" -ForegroundColor Cyan
docker tag gestor-frontend:latest $frontendImage

Write-Host ""
Write-Host "Pushing backend..." -ForegroundColor Cyan
docker push $backendImage
Write-Success "Backend pushed com sucesso"

Write-Host ""
Write-Host "Pushing frontend..." -ForegroundColor Cyan
docker push $frontendImage
Write-Success "Frontend pushed com sucesso"

Write-Header "PASSO 4: Preparando Deploy no OCI"

switch ($DeploymentType) {
    "container-instances" {
        Write-Host "Deploy type: Container Instances" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Próximas ações no OCI Console:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Vá para: Compute > Container Instances" -ForegroundColor White
        Write-Host "2. Clique em 'Create container instance'" -ForegroundColor White
        Write-Host "3. Use as seguintes configurações:" -ForegroundColor White
        Write-Host "   - Display Name: gestor-multiprojetos-backend" -ForegroundColor Gray
        Write-Host "   - Image: $backendImage" -ForegroundColor Gray
        Write-Host "   - CPU: 1" -ForegroundColor Gray
        Write-Host "   - Memory: 2 GB" -ForegroundColor Gray
        Write-Host "   - Compartment: $env:OCI_COMPARTMENT_ID" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Repita para o frontend:" -ForegroundColor White
        Write-Host "   - Display Name: gestor-multiprojetos-frontend" -ForegroundColor Gray
        Write-Host "   - Image: $frontendImage" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Depois configure:" -ForegroundColor Cyan
        Write-Host "  - PostgreSQL Managed Database" -ForegroundColor Gray
        Write-Host "  - Redis Cache" -ForegroundColor Gray
        Write-Host "  - Network Load Balancer" -ForegroundColor Gray
        Write-Host "  - DNS (se tiver domínio)" -ForegroundColor Gray
    }
    
    "oke" {
        Write-Host "Deploy type: OKE (Kubernetes)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Criando manifests Kubernetes..." -ForegroundColor Yellow
        Write-Host ""
        
        # Criar diretório kubernetes
        $k8sDir = "$projectRoot\kubernetes"
        if (-not (Test-Path $k8sDir)) {
            New-Item -ItemType Directory -Path $k8sDir -Force | Out-Null
        }
        
        # Backend Deployment
        $backendK8s = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gestor-backend
  labels:
    app: gestor-backend
spec:
  replicas: 2
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
        image: $backendImage
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: gestor-config
              key: db-host
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: gestor-secrets
              key: db-password
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: gestor-backend-service
spec:
  type: LoadBalancer
  selector:
    app: gestor-backend
  ports:
  - protocol: TCP
    port: 3001
    targetPort: 3001
"@
        Set-Content -Path "$k8sDir\backend.yaml" -Value $backendK8s
        Write-Success "Criado: $k8sDir\backend.yaml"
        
        # Frontend Deployment
        $frontendK8s = @"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gestor-frontend
  labels:
    app: gestor-frontend
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
        image: $frontendImage
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_API_URL
          value: "https://<seu-dominio>.com.br"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: gestor-frontend-service
spec:
  type: LoadBalancer
  selector:
    app: gestor-frontend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
"@
        Set-Content -Path "$k8sDir\frontend.yaml" -Value $frontendK8s
        Write-Success "Criado: $k8sDir\frontend.yaml"
        
        Write-Host ""
        Write-Host "📝 Próximas ações:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Crie um cluster OKE:" -ForegroundColor White
        Write-Host "   https://docs.oracle.com/en-us/iaas/Content/ContEng/Tasks/contengcreatingclusterusingoke.htm" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Configure kubectl:" -ForegroundColor White
        Write-Host "   oci ce cluster create-kubeconfig --cluster-id <CLUSTER_ID> --file $HOME\.kube\config --region $ocirRegion" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Crie secrets e configmaps:" -ForegroundColor White
        Write-Host "   kubectl create secret generic gestor-secrets --from-literal=db-password=<PASSWORD>" -ForegroundColor Gray
        Write-Host "   kubectl create configmap gestor-config --from-literal=db-host=<DB_HOST>" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Deploy:" -ForegroundColor White
        Write-Host "   kubectl apply -f $k8sDir\backend.yaml" -ForegroundColor Gray
        Write-Host "   kubectl apply -f $k8sDir\frontend.yaml" -ForegroundColor Gray
    }
    
    "compute" {
        Write-Host "Deploy type: Compute Instance" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Próximas ações:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Crie uma Compute Instance:" -ForegroundColor White
        Write-Host "   - Image: Ubuntu 22.04 LTS" -ForegroundColor Gray
        Write-Host "   - Shape: VM.Standard.E4.Flex (4 OCPUs, 16 GB)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Conecte via SSH e instale Docker" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Faça login no OCIR:" -ForegroundColor White
        Write-Host "   docker login $ocirRegistry" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Deploy com docker-compose:" -ForegroundColor White
        Write-Host "   docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor Gray
    }
}

Write-Header "✓ Deploy Preparado"

Write-Host "Imagens Docker estão prontas em:" -ForegroundColor Green
Write-Host "  Backend:  $backendImage" -ForegroundColor Gray
Write-Host "  Frontend: $frontendImage" -ForegroundColor Gray
Write-Host ""

Write-Host "Variáveis de ambiente guardadas em:" -ForegroundColor Green
Write-Host "  $env_File" -ForegroundColor Gray
Write-Host ""

Write-Host "Configuração OCI:" -ForegroundColor Cyan
Write-Host "  Tenancy:     $env:OCI_TENANCY_ID" -ForegroundColor Gray
Write-Host "  Region:      $env:OCI_REGION" -ForegroundColor Gray
Write-Host "  Compartment: $env:OCI_COMPARTMENT_ID" -ForegroundColor Gray
Write-Host ""

Write-Host "Para mais informações, acesse:" -ForegroundColor Cyan
Write-Host "  https://docs.oracle.com/en-us/iaas/Content/home.htm" -ForegroundColor Blue
Write-Host ""
