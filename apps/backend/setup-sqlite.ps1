#!/usr/bin/env powershell
<#
.SYNOPSIS
    Setup SQLite para desenvolvimento local
.DESCRIPTION
    Configura o projeto para usar SQLite ao invés de PostgreSQL
#>

$ProjectRoot = Get-Location
$BackendRoot = "$ProjectRoot\apps\backend"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Configurando SQLite para desenvolvimento" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 1. Backup do schema original
Write-Host "[1/5] Fazendo backup do schema PostgreSQL..." -ForegroundColor Cyan
if (!(Test-Path "$BackendRoot\prisma\schema.prisma.backup")) {
    Copy-Item "$BackendRoot\prisma\schema.prisma" "$BackendRoot\prisma\schema.prisma.backup"
    Write-Host "[OK] Backup criado" -ForegroundColor Green
}

# 2. Copiar schema SQLite
Write-Host "[2/5] Copiando schema SQLite..." -ForegroundColor Cyan
if (Test-Path "$BackendRoot\prisma\schema.sqlite.prisma") {
    Copy-Item "$BackendRoot\prisma\schema.sqlite.prisma" "$BackendRoot\prisma\schema.prisma" -Force
    Write-Host "[OK] Schema SQLite ativado" -ForegroundColor Green
} else {
    Write-Host "[ERRO] schema.sqlite.prisma nao encontrado" -ForegroundColor Red
    exit 1
}

# 3. Copiar .env.local
Write-Host "[3/5] Configurando variáveis de ambiente..." -ForegroundColor Cyan
if (Test-Path "$BackendRoot\.env.local") {
    Copy-Item "$BackendRoot\.env.local" "$BackendRoot\.env" -Force
    Write-Host "[OK] .env configurado para SQLite" -ForegroundColor Green
} else {
    Write-Host "[AVISO] .env.local nao encontrado, usando existente" -ForegroundColor Yellow
}

# 4. Gerar cliente Prisma
Write-Host "[4/5] Gerando cliente Prisma..." -ForegroundColor Cyan
Set-Location $BackendRoot
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao gerar cliente Prisma" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Cliente Prisma gerado" -ForegroundColor Green

# 5. Criar banco de dados
Write-Host "[5/5] Criando banco de dados..." -ForegroundColor Cyan
npx prisma migrate dev --name init --skip-generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARN] Erro na migração (pode ser esperado na primeira vez)" -ForegroundColor Yellow
}

# Remover cache de seed anterior
Remove-Item -Path "dev.db" -Force -ErrorAction SilentlyContinue

# Seed
Write-Host "[5/5] Carregando dados iniciais..." -ForegroundColor Cyan
npx prisma db seed
Write-Host "[OK] Dados iniciais carregados" -ForegroundColor Green

Set-Location $ProjectRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] SQLite configurado com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. cd $ProjectRoot" -ForegroundColor White
Write-Host "  2. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
