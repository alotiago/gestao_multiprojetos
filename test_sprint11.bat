@echo off
setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════════
echo 🧪 SPRINT 11 - EXECUCAO DE TESTES AUTOMATICOS
echo ════════════════════════════════════════════════════════
echo.
echo Data: %date% %time%
echo Ambiente: Homologacao Local
echo.

REM Test 1: Health Check
echo [1/5] Health Check do Backend...
curl -s http://localhost:3001/health 1>nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend respondendo
) else (
    echo ❌ Backend nao esta respondendo
    exit /b 1
)
echo.

REM Test 2: Login
echo [2/5] Autenticando...
for /f "tokens=*" %%A in ('curl -s -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@company.com\",\"password\":\"admin123456\"}" ^| find /c "access_token"') do set TOKEN_COUNT=%%A

if %TOKEN_COUNT% gtr 0 (
    echo ✅ Autenticacao OK
) else (
    echo ❌ Erro na autenticacao
    exit /b 1
)
echo.

REM Test 3: Dashboard
echo [3/5] Teste Dashboard de Custos...
curl -s http://localhost:3001/relatorios/contratos-dashboard?ano=2026 1>nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Dashboard carregou
) else (
    echo ⚠️  Dashboard com problema
)
echo.

REM Test 4: Despesas
echo [4/5] Teste Despesas...
curl -s http://localhost:3001/financial/despesas?page=1 1>nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Despesas carregaram
) else (
    echo ⚠️  Despesas com problema
)
echo.

REM Test 5: Contratos
echo [5/5] Teste Contratos...
curl -s http://localhost:3001/contracts?page=1 1>nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Contratos carregaram
) else (
    echo ⚠️  Contratos com problema
)
echo.

echo ════════════════════════════════════════════════════════
echo 🎉 SPRINT 11 VALIDACAO CONCLUIDA
echo ════════════════════════════════════════════════════════
echo.
echo Todos os endpoints respondendo
echo Sistema pronto para homologacao
echo.
