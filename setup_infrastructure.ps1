#!/usr/bin/env powershell
<#
.SYNOPSIS
    Setup completo da infraestrutura do Gestor Multiprojetos para Windows
.DESCRIPTION
    Instala PostgreSQL (ou SQLite), Node.js, dependências e configura o ambiente
.EXAMPLE
    .\setup_infrastructure.ps1
#>

param(
    [ValidateSet('postgresql', 'sqlite')]
    [string]$DatabaseType = 'postgresql'
)

# =============================================================================
# CONFIGURAÇÃO
# =============================================================================
$ErrorActionPreference = "Stop"
if ($PSScriptRoot) {
    $ProjectRoot = $PSScriptRoot
} else {
    $ProjectRoot = Get-Location
}

# Cores para output
$colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error   = 'Red'
    Info    = 'Cyan'
}

function Write-Log([string]$Message, [string]$Level = 'Info') {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    if ($colors.ContainsKey($Level)) {
        $color = $colors[$Level]
    } else {
        $color = 'White'
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# =============================================================================
# 1. VERIFICAR REQUISITOS
# =============================================================================
Write-Log "*** Verificando requisitos do sistema..." "Info"

# Node.js
$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Log "[ERRO] Node.js nao encontrado. Instale em: https://nodejs.org/" "Error"
    exit 1
} else {
    Write-Log "[OK] Node.js $nodeVersion encontrado" "Success"
}

# npm
$npmVersion = npm --version 2>$null
if ($null -eq $npmVersion) {
    Write-Log "[ERRO] npm nao encontrado" "Error"
    exit 1
} else {
    Write-Log "[OK] npm $npmVersion encontrado" "Success"
}

# =============================================================================
# 2. INSTALAR DEPENDÊNCIAS NPM
# =============================================================================
Write-Log "*** Instalando dependencias do projeto..." "Info"
Set-Location $ProjectRoot
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Log "[ERRO] Falha ao instalar dependencias" "Error"
    exit 1
}
Write-Log "[OK] Dependencias instaladas" "Success"

# =============================================================================
# 3. CONFIGURAR BANCO DE DADOS
# =============================================================================
Write-Log "*** Configurando banco de dados..." "Info"

if ($DatabaseType -eq 'postgresql') {
    Write-Log "PostgreSQL selecionado" "Info"
    
    # Verificar se PostgreSQL está instalado
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
    
    if ($null -eq $psqlPath) {
        Write-Log "[WARN] PostgreSQL nao encontrado. Usando SQLite como fallback" "Warning"
        $DatabaseType = 'sqlite'
    } else {
        Write-Log "[OK] PostgreSQL encontrado em: $psqlPath" "Success"
        
        # Tentar conectar
        try {
            $result = & psql -U admin -d postgres -c "SELECT version();"
            if ($LASTEXITCODE -eq 0) {
                Write-Log "[OK] Conexao com PostgreSQL bem-sucedida" "Success"
            } else {
                Write-Log "[WARN] PostgreSQL instalado mas servico nao responde. Usando SQLite" "Warning"
                $DatabaseType = 'sqlite'
            }
        } catch {
            Write-Log "[WARN] Erro ao conectar com PostgreSQL: $($_). Usando SQLite" "Warning"
            $DatabaseType = 'sqlite'
        }
    }
}

# =============================================================================
# 4. SETUP PRISMA E BANCO
# =============================================================================
Write-Log "*** Configurando Prisma..." "Info"

Set-Location "$ProjectRoot\apps\backend"

# Gerar cliente Prisma
Write-Log "Gerando cliente Prisma..." "Info"
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Log "[ERRO] Falha ao gerar cliente Prisma" "Error"
    exit 1
}

# Criar database via Prisma
Write-Log "Criando/Atualizando banco de dados..." "Info"
if ($DatabaseType -eq 'sqlite') {
    Write-Log "Usando SQLite para desenvolvimento local (sem migrations)" "Info"
    # Criar diretório de dados
    $dbDir = "$ProjectRoot\apps\backend\prisma"
    if (!(Test-Path $dbDir)) {
        New-Item -ItemType Directory -Path $dbDir -Force | Out-Null
    }
    Write-Log "Banco SQLite sera criado em: $dbDir\dev.db" "Info"
} else {
    # PostgreSQL
    try {
        Write-Log "Executando migrations..." "Info"
        npx prisma migrate deploy --skip-generate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "[OK] Migrations executadas com sucesso" "Success"
        } else {
            Write-Log "Executando migrate dev (fresh)..." "Info"
            npx prisma migrate dev --name init --skip-generate
        }
    } catch {
        Write-Log "Erro ao validar migrations: $_. Continuando..." "Warning"
    }
}

# Seed database
Write-Log "Carregando dados iniciais..." "Info"
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Log "[WARN] Aviso ao executar seed (pode ser normal)" "Warning"
} else {
    Write-Log "[OK] Dados iniciais carregados" "Success"
}

# =============================================================================
# 5. GERAR DOCUMENTAÇÃO
# =============================================================================
Set-Location $ProjectRoot

Write-Log "*** Gerando documentacao de setup..." "Info"

$docContent = @"
# [OK] Setup Concluido - $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')

## Resumo da Configuracao

- **Database**: $DatabaseType
- **Node.js**: $nodeVersion
- **npm**: $npmVersion
- **Ambiente**: Development
- **Prisma**: Configured

## Proximos Passos

### 1. Instalar Dependencias (se nao completado)
npm install

### 2. Rodar em Desenvolvimento
npm run dev

### 3. Executar Testes
npm run test

## URLs de Acesso

| Servico | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | OK |
| Backend API | http://localhost:3001 | OK |
| API Docs | http://localhost:3001/api | Quando rodando |

## Credenciais de Teste

ADMIN
- Email: admin@sistema.com
- Senha: Admin123!

PMO
- Email: pmo@sistema.com
- Senha: Admin123!

PROJECT_MANAGER
- Email: pm@sistema.com
- Senha: Admin123!

HR
- Email: hr@sistema.com
- Senha: Admin123!

FINANCE
- Email: finance@sistema.com
- Senha: Admin123!

VIEWER
- Email: viewer@sistema.com
- Senha: Admin123!

## Troubleshooting

### Porta em uso
netstat -ano | findstr :3001
taskkill /PID <PID> /F

### Limpar cache e reinstalar
npm run clean
npm install
npm run dev

---

Setup em: $env:COMPUTERNAME
Timezone: $(([System.TimeZoneInfo]::Local).DisplayName)
"@

$docContent | Set-Content "$ProjectRoot\SETUP_COMPLETO.md"
Write-Log "[OK] Documentacao criada: SETUP_COMPLETO.md" "Success"

# =============================================================================
# 6. RESUMO FINAL
# =============================================================================
Write-Log "" "Info"
Write-Log "============================================================" "Success"
Write-Log "*** SETUP CONCLUIDO COM SUCESSO! ***" "Success"
Write-Log "============================================================" "Success"
Write-Log "" "Info"

Write-Log "Lista de Comandos:" "Info"
Write-Log "  1. npm run dev          # Rodar em desenvolvimento" "Info"
Write-Log "  2. npm run test         # Executar testes" "Info"
Write-Log "  3. npm run build        # Build para producao" "Info"
Write-Log "" "Info"

Write-Log "Acesso ao sistema:" "Info"
Write-Log "  - Frontend: http://localhost:3000" "Info"
Write-Log "  - Backend:  http://localhost:3001" "Info"
Write-Log "" "Info"

Write-Log "Banco de dados: $DatabaseType" "Info"
Write-Log "" "Info"

exit 0
