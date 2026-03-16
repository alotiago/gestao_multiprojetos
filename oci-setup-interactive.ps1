# ============================================================================
# OCI Setup Interativo - Gestor Multiprojetos
# ============================================================================
# Script para configurar credenciais OCI e preparar o deploy

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

function Read-Secret {
    param([string]$Prompt)
    Write-Host $Prompt -NoNewline
    $secret = Read-Host -AsSecureString
    $cred = New-Object System.Management.Automation.PSCredential("user", $secret)
    return $cred.GetNetworkCredential().Password
}

# ============================================================================
# INÍCIO DO SCRIPT
# ============================================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║      ✓ OCI Setup Interativo - Gestor Multiprojetos          ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Header "PASSO 1: Informações de Autenticação OCI"

Write-Host "Você pode obter essas informações em OCI Console > Account Settings" -ForegroundColor DarkGray
Write-Host ""

# Tenancy ID
do {
    $tenancyId = Read-Host "Tenancy ID (ocid1.tenancy.oc1..aaaaaa...)"
    if ([string]::IsNullOrWhiteSpace($tenancyId)) {
        Write-Error-Custom "Tenancy ID é obrigatório"
        continue
    }
    if (-not $tenancyId.StartsWith("ocid1.tenancy.oc1")) {
        Write-Warning "Tenancy ID deve começar com 'ocid1.tenancy.oc1'"
        continue
    }
    break
} while ($true)

# User ID
do {
    $userId = Read-Host "User ID (ocid1.user.oc1..aaaaaa...)"
    if ([string]::IsNullOrWhiteSpace($userId)) {
        Write-Error-Custom "User ID é obrigatório"
        continue
    }
    if (-not $userId.StartsWith("ocid1.user.oc1")) {
        Write-Warning "User ID deve começar com 'ocid1.user.oc1'"
        continue
    }
    break
} while ($true)

# Fingerprint
do {
    $fingerprint = Read-Host "Fingerprint da private key (aa:bb:cc:dd:ee:ff...)"
    if ([string]::IsNullOrWhiteSpace($fingerprint)) {
        Write-Error-Custom "Fingerprint é obrigatória"
        continue
    }
    if ($fingerprint -notmatch '^[0-9a-f]{2}(:[0-9a-f]{2}){15}$') {
        Write-Warning "Fingerprint inválida. Formato esperado: aa:bb:cc:dd:ee:ff..."
        continue
    }
    break
} while ($true)

# Region
Write-Host ""
Write-Host "Regiões OCI disponíveis:" -ForegroundColor DarkGray
Write-Host "  - us-phoenix-1 (Phoenix, USA)" -ForegroundColor DarkGray
Write-Host "  - sa-saopaulo-1 (São Paulo, Brasil)" -ForegroundColor DarkGray
Write-Host "  - us-ashburn-1 (Ashburn, USA)" -ForegroundColor DarkGray

do {
    $region = Read-Host "Region"
    if ([string]::IsNullOrWhiteSpace($region)) {
        Write-Error-Custom "Region é obrigatória"
        continue
    }
    $validRegions = @("us-phoenix-1", "sa-saopaulo-1", "us-ashburn-1", "eu-frankfurt-1", "ap-tokyo-1")
    if ($region -notin $validRegions) {
        Write-Warning "Region '$region' pode não ser válida. Regiões suportadas: $($validRegions -join ', ')"
    }
    break
} while ($true)

# Private Key File Path
Write-Host ""
Write-Host "Agora preciso do caminho para sua private key OCI" -ForegroundColor DarkGray
Write-Host "Geralmente está em ~/.oci/oci_api_key.pem" -ForegroundColor DarkGray

do {
    $keyPath = Read-Host "Caminho da private key"
    if ([string]::IsNullOrWhiteSpace($keyPath)) {
        Write-Error-Custom "Caminho da private key é obrigatório"
        continue
    }
    
    # Expandir caracteres especiais
    $keyPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($keyPath)
    
    if (-not (Test-Path $keyPath)) {
        Write-Error-Custom "Arquivo não encontrado: $keyPath"
        continue
    }
    
    break
} while ($true)

Write-Success "Private key encontrada: $keyPath"

# ============================================================================

Write-Header "PASSO 2: Informações de Container Registry (OCIR)"

Write-Host "OCIR é o Docker Registry gerenciado pela OCI" -ForegroundColor DarkGray
Write-Host ""

# Namespace OCIR
do {
    $ocirNamespace = Read-Host "OCIR Namespace (geralmente seu tenancy name)"
    if ([string]::IsNullOrWhiteSpace($ocirNamespace)) {
        Write-Error-Custom "OCIR Namespace é obrigatório"
        continue
    }
    break
} while ($true)

# Username OCIR
do {
    $ocirUsername = Read-Host "OCIR Username (formato: tenancy-name/user-email)"
    if ([string]::IsNullOrWhiteSpace($ocirUsername)) {
        Write-Error-Custom "OCIR Username é obrigatório"
        continue
    }
    break
} while ($true)

# Auth Token
$ocirAuthToken = Read-Secret "OCIR Auth Token (será mantida em segredo): "

# ============================================================================

Write-Header "PASSO 3: Informações de Deployment"

Write-Host ""
Write-Host "Escolha o tipo de deployment:" -ForegroundColor Cyan
Write-Host "  1) Container Instances (simples, sem orquestração)" -ForegroundColor Gray
Write-Host "  2) OKE - Oracle Kubernetes Engine (escalável)" -ForegroundColor Gray
Write-Host "  3) Compute Instances + Docker (máquina virtual)" -ForegroundColor Gray
Write-Host ""

do {
    $deploymentType = Read-Host "Escolha (1, 2 ou 3)"
    if ($deploymentType -in @("1", "2", "3")) {
        break
    }
    Write-Error-Custom "Opção inválida. Escolha 1, 2 ou 3"
} while ($true)

$deploymentTypeMap = @{
    "1" = "container-instances"
    "2" = "oke"
    "3" = "compute"
}
$deploymentTypeValue = $deploymentTypeMap[$deploymentType]

# Compartment
Write-Host ""
do {
    $compartmentId = Read-Host "Compartment ID (ou deixe em branco para usar o root)"
    if ([string]::IsNullOrWhiteSpace($compartmentId)) {
        $compartmentId = $tenancyId
        Write-Host "Usando root compartment: $tenancyId" -ForegroundColor DarkGray
    }
    break
} while ($true)

# DatabaseUser e Password
Write-Host ""
Write-Host "Credenciais do PostgreSQL:" -ForegroundColor Cyan

do {
    $dbUser = Read-Host "Database User (padrão: admin)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) {
        $dbUser = "admin"
    }
    break
} while ($true)

$dbPassword = Read-Secret "Database Password: "

# Redis Password
$redisPassword = Read-Secret "Redis Password: "

# ============================================================================

Write-Header "PASSO 4: Criando Arquivos de Configuração"

# Criar diretório .oci se não existir
$ociDir = "$env:USERPROFILE\.oci"
if (-not (Test-Path $ociDir)) {
    New-Item -ItemType Directory -Path $ociDir -Force | Out-Null
    Write-Success "Diretório OCI criado: $ociDir"
}

# Criar arquivo config
$configPath = "$ociDir\config"
$configContent = @"
[DEFAULT]
user=$userId
fingerprint=$fingerprint
tenancy=$tenancyId
region=$region
key_file=$keyPath
"@

Set-Content -Path $configPath -Value $configContent
Write-Success "Arquivo de configuração OCI criado: $configPath"

# Copiar private key se não estiver em .oci
$keyDestPath = "$ociDir\oci_api_key.pem"
if ($keyPath -ne $keyDestPath) {
    Copy-Item -Path $keyPath -Destination $keyDestPath -Force
    Write-Success "Private key copiada para: $keyDestPath"
}

# ============================================================================

# Criar arquivo .env para o projeto
Write-Header "PASSO 5: Gerando Arquivos de Ambiente"

$envPath = "c:\des\gestor_multiprojetos\.env.oci"
$envContent = @"
# ========== NODE ENVIRONMENT ==========
NODE_ENV=production

# ========== DATABASE ==========
DATABASE_HOST=<postgres-endpoint>
DATABASE_PORT=5432
DATABASE_NAME=gestor_multiprojetos
DATABASE_USER=$dbUser
DATABASE_PASSWORD=$dbPassword
DATABASE_URL=postgresql://$dbUser:$dbPassword@<postgres-endpoint>:5432/gestor_multiprojetos?schema=public

# ========== REDIS ==========
REDIS_HOST=<redis-endpoint>
REDIS_PORT=6379
REDIS_PASSWORD=$redisPassword

# ========== APPLICATION ==========
NEXT_PUBLIC_API_URL=https://<seu-dominio>.com.br
JWT_SECRET=$(Get-Random -Minimum 1000000000 -Maximum 9999999999)
JWT_EXPIRATION=24h

# ========== OCI ==========
OCI_TENANCY_ID=$tenancyId
OCI_USER_ID=$userId
OCI_FINGERPRINT=$fingerprint
OCI_REGION=$region
OCI_COMPARTMENT_ID=$compartmentId
OCI_DEPLOYMENT_TYPE=$deploymentTypeValue

# ========== OCIR ==========
OCIR_NAMESPACE=$ocirNamespace
OCIR_USERNAME=$ocirUsername
OCIR_REGION=$region
"@

Set-Content -Path $envPath -Value $envContent
Write-Success "Arquivo de ambiente criado: $envPath"

# ============================================================================

Write-Header "PASSO 6: Validando Credenciais OCI"

Write-Host "Testando conexão com OCI..." -ForegroundColor Cyan

try {
    $env:OCI_CLI_PROFILE = "DEFAULT"
    $env:OCI_CONFIG_FILE = $configPath
    
    # Tentar executar um comando simples da OCI CLI
    $testOutput = & oci os ns get 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Credenciais OCI validadas com sucesso!"
        Write-Host "Namespace OCI: $testOutput" -ForegroundColor Green
    } else {
        Write-Warning "Não foi possível validar credenciais. Verifique se a OCI CLI está instalada."
        Write-Host "Instale em: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm" -ForegroundColor DarkGray
    }
} catch {
    Write-Warning "Validação de credenciais retornou um aviso (pode ser normal)"
    Write-Host $_.Exception.Message -ForegroundColor DarkGray
}

# ============================================================================

Write-Header "✓ Setup Concluído"

Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Instale a OCI CLI (se ainda não tem):" -ForegroundColor White
Write-Host "   https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2. Instale o Docker:" -ForegroundColor White
Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Faça login no OCIR:" -ForegroundColor White
Write-Host "   docker login $region.ocir.io" -ForegroundColor DarkGray
Write-Host "   Username: $ocirUsername" -ForegroundColor DarkGray
Write-Host ""
Write-Host "4. Execute o script de deployment:" -ForegroundColor White
Write-Host "   .\oci-deploy.ps1 -DeploymentType $deploymentTypeValue" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Arquivos criados:" -ForegroundColor Cyan
Write-Host "  - $configPath" -ForegroundColor DarkGray
Write-Host "  - $envPath" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Configuração guardada em: OCI_CONFIG_FILE=$configPath" -ForegroundColor Green
Write-Host ""

# Salvar configurações para reutilização
$configJson = @{
    tenancyId = $tenancyId
    userId = $userId
    fingerprint = $fingerprint
    region = $region
    ocirNamespace = $ocirNamespace
    deploymentType = $deploymentTypeValue
    compartmentId = $compartmentId
} | ConvertTo-Json

Set-Content -Path "c:\des\gestor_multiprojetos\.oci-setup.json" -Value $configJson
Write-Success "Configurações guardadas em: c:\des\gestor_multiprojetos\.oci-setup.json"

Write-Host ""
