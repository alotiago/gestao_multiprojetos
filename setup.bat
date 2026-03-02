@echo off
REM Setup Script for Gestor Multiprojetos - Windows Batch
REM Este script automatiza todo o setup de desenvolvimento

setlocal enabledelayedexpansion

cls
echo.
echo ============================================
echo  SETUP - Gestor Multiprojetos Sprint 2
echo ============================================
echo.

REM 1. Verificar Node.js
echo [1/6] Verificando Node.js...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   Node: !NODE_VERSION!

REM 2. Verificar npm
echo [2/6] Verificando npm...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo   npm: !NPM_VERSION!
echo.

REM 3. Gerar Prisma Client
echo [3/6] Gerando Prisma Client...
cd apps\backend
call npx prisma generate
cd ..\..
echo.

REM 4. Informar sobre Docker
echo [4/6] Verificando Docker...
docker --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo   Docker: !DOCKER_VERSION!
) else (
    echo   Docker: NOT FOUND (Instale em: https://docs.docker.com/get-docker/)
)
echo.

REM 5. Info de próximos passos
echo [5/6] Proximos passos:
echo   1. Iniciar Docker:
echo      docker compose up -d
echo.
echo   2. Executar Migrations:
echo      cd apps\backend
echo      npx prisma migrate dev --name init
echo      cd ..\..
echo.
echo   3. Rodar Testes:
echo      npm run test
echo.
echo   4. Iniciar Dev:
echo      npm run dev
echo.

REM 6. Concluir
echo [6/6] Setup Completo!
echo ============================================
echo.
pause
