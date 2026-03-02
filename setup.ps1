# Setup Script for Gestor Multiprojetos
# Este script configura o ambiente de desenvolvimento

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🚀 SETUP - Gestor Multiprojetos Sprint 2" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js e npm
Write-Host "📋 Checando Node.js e npm..." -ForegroundColor Yellow
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "  ✓ Node.js: $nodeVersion"
Write-Host "  ✓ npm: $npmVersion"
Write-Host ""

# 2. Verificar Docker
Write-Host "📋 Checando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  ✓ Docker: $dockerVersion"
} catch {
    Write-Host "  ⚠ Docker não encontrado. Instale em: https://docs.docker.com/get-docker/" -ForegroundColor Red
}
Write-Host ""

# 3. npm install (já rodou em background, mas vou verificar)
Write-Host "📦 Verificando dependências NPM..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules encontrado"
} else {
    Write-Host "  ℹ Instalando dependências com npm install --legacy-peer-deps..." -ForegroundColor Cyan
    npm install --legacy-peer-deps
}
Write-Host ""

# 4. Gerar prisma client
Write-Host "🔧 Gerando cliente Prisma..." -ForegroundColor Yellow
cd apps/backend
npx prisma generate
cd ../..
Write-Host "  ✓ Prisma client gerado"
Write-Host ""

# 5. Status
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Completo!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximas ações:" -ForegroundColor Cyan
Write-Host "  1. Executar Docker:"
Write-Host "     docker compose up -d"
Write-Host ""
Write-Host "  2. Executar migrations Prisma:"
Write-Host "     cd apps/backend"
Write-Host "     npx prisma migrate dev --name init"
Write-Host ""
Write-Host "  3. Seed de dados iniciais:"
Write-Host "     npx prisma db seed"
Write-Host ""
Write-Host "  4. Rodar testes:"
Write-Host "     npm run test"
Write-Host ""
Write-Host "  5. Iniciar desenvolvimento:"
Write-Host "     npm run dev"
Write-Host ""
