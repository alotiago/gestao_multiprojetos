param(
    [string]$VmHost = "10.10.11.92",
    [string]$Domain = "gestaodeprojetos.oais.cloud",
    [string]$VmUser = "gestor",
    [string]$LocalProjectPath = "C:\des\gestor_multiprojetos",
    [string]$RemoteProjectPath = "/opt/gestor_multiprojetos",
    [string]$RemoteTempDir = "/tmp/gmp-prod-deploy",
    [string]$ArchiveOutputDir = "$env:TEMP\gmp-prod-deploy",
    [switch]$RunMigrations,
    [switch]$ConfigureHostNginx,
    [switch]$FailOnExternalHttpsCheck,
    [string]$HostNginxEmail,
    [securestring]$Password,
    [string]$PlainTextPassword,
    [switch]$Execute,
    [switch]$KeepRemoteArchive
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([string]$Text)
    Write-Host "`n== $Text ==" -ForegroundColor Cyan
}

function Ensure-PathExists {
    param([string]$PathToCheck, [string]$Description)
    if (-not (Test-Path $PathToCheck)) {
        throw "$Description nao encontrado: $PathToCheck"
    }
}

function Ensure-ModuleInstalled {
    param([string]$ModuleName)
    if (-not (Get-Module -ListAvailable -Name $ModuleName)) {
        throw "Modulo $ModuleName nao encontrado. Instale antes com: Install-Module $ModuleName -Scope CurrentUser"
    }
}

function Ensure-CommandAvailable {
    param([string]$CommandName)
    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "Comando obrigatorio nao encontrado: $CommandName"
    }
}

function Convert-SecureStringToPlainText {
    param([securestring]$SecureValue)
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Convert-PlainTextToSecureString {
    param([string]$Text)
    if ([string]::IsNullOrWhiteSpace($Text)) {
        return $null
    }

    return ConvertTo-SecureString -String $Text -AsPlainText -Force
}

function Escape-BashSingleQuotedString {
    param([string]$Text)
    return $Text -replace "'", ("'" + '"' + "'" + '"' + "'")
}

function Send-RemoteFile {
    param(
        [int]$SessionId,
        [string]$LocalFile,
        [string]$RemotePath
    )

    $remoteDirectory = if ($RemotePath -match '^(.*)/[^/]+$') { $matches[1] } else { '.' }

    if (Get-Command -Name 'Set-SFTPItem' -ErrorAction SilentlyContinue) {
        Set-SFTPItem -SessionId $SessionId -Path $LocalFile -Destination $remoteDirectory -Force
        return
    }

    if (Get-Command -Name 'Set-SFTPFile' -ErrorAction SilentlyContinue) {
        Set-SFTPFile -SessionId $SessionId -LocalFile $LocalFile -RemotePath $RemotePath
        return
    }

    throw 'Nenhum cmdlet de upload SFTP suportado foi encontrado no modulo Posh-SSH (esperado: Set-SFTPItem ou Set-SFTPFile).'
}

function New-DeployArchive {
    param(
        [string]$SourcePath,
        [string]$OutputDirectory
    )

    Ensure-CommandAvailable -CommandName "tar.exe"
    Ensure-PathExists -PathToCheck $SourcePath -Description "Projeto local"

    if (-not (Test-Path $OutputDirectory)) {
        New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
    }

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $archivePath = Join-Path $OutputDirectory "gestor_multiprojetos_prod_$timestamp.tar.gz"
    $excludeArgs = @(
        "--exclude=.git",
        "--exclude=.next",
        "--exclude=node_modules",
        "--exclude=dist",
        "--exclude=coverage",
        "--exclude=deploy-secrets.env",
        "--exclude=.env",
        "--exclude=.env.*",
        "--exclude=*.log"
    )

    Push-Location $SourcePath
    try {
        & tar.exe @excludeArgs -czf $archivePath .
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao gerar arquivo compactado de deploy"
        }
    }
    finally {
        Pop-Location
    }

    return $archivePath
}

Write-Section "Preparando pacote local"
$archivePath = New-DeployArchive -SourcePath $LocalProjectPath -OutputDirectory $ArchiveOutputDir
$archiveName = Split-Path $archivePath -Leaf
$remoteArchivePath = "$RemoteTempDir/$archiveName"
$bootstrapLocalPath = Join-Path $ArchiveOutputDir "bootstrap_prod_https.sh"
$runMigrationsFlag = if ($RunMigrations) { 'true' } else { 'false' }
$configureHostNginxFlag = if ($ConfigureHostNginx) { 'true' } else { 'false' }
$failOnExternalHttpsCheckFlag = if ($FailOnExternalHttpsCheck) { 'true' } else { 'false' }

$bootstrapTemplate = @'
#!/usr/bin/env bash
set -euo pipefail

REMOTE_PROJECT_PATH="__REMOTE_PROJECT_PATH__"
REMOTE_TEMP_DIR="__REMOTE_TEMP_DIR__"
REMOTE_ARCHIVE_PATH="__REMOTE_ARCHIVE_PATH__"
DOMAIN="__DOMAIN__"
VM_USER="__VM_USER__"
VM_GROUP="$(id -gn "$VM_USER" 2>/dev/null || echo "$VM_USER")"
HOST_NGINX_EMAIL="__HOST_NGINX_EMAIL__"
RUN_MIGRATIONS="__RUN_MIGRATIONS__"
CONFIGURE_HOST_NGINX="__CONFIGURE_HOST_NGINX__"
FAIL_ON_EXTERNAL_HTTPS_CHECK="__FAIL_ON_EXTERNAL_HTTPS_CHECK__"
STAGING_DIR="$REMOTE_TEMP_DIR/app_staging"
BACKUP_DIR="${REMOTE_PROJECT_PATH}.previous"
FAILED_DIR="${REMOTE_PROJECT_PATH}.failed"
SWAP_COMPLETED="false"
ROLLBACK_COMPLETED="false"

mkdir -p "$REMOTE_TEMP_DIR"

rollback_previous_release() {
    if [ "$SWAP_COMPLETED" != "true" ] || [ "$ROLLBACK_COMPLETED" = "true" ]; then
        return 0
    fi

    if [ ! -d "$BACKUP_DIR" ]; then
        echo "Rollback indisponivel: backup anterior nao encontrado em $BACKUP_DIR"
        return 1
    fi

    echo "Restaurando versao anterior da aplicacao..."
    rm -rf "$FAILED_DIR"
    if [ -d "$REMOTE_PROJECT_PATH" ]; then
        mv "$REMOTE_PROJECT_PATH" "$FAILED_DIR"
    fi

    mv "$BACKUP_DIR" "$REMOTE_PROJECT_PATH"
    chown -R "$VM_USER:$VM_GROUP" "$REMOTE_PROJECT_PATH"
    cd "$REMOTE_PROJECT_PATH"

    docker compose -f docker-compose.oci.yml up -d postgres redis backend frontend nginx || true
    ROLLBACK_COMPLETED="true"
}

fail_deploy() {
    local message="$1"
    echo "$message"
    print_logs_on_failure
    rollback_previous_release || true
    exit 1
}

# Preserva .env existente para manter segredos, credenciais e compatibilidade com volumes persistidos.
if [ -f "$REMOTE_PROJECT_PATH/.env" ]; then
    cp "$REMOTE_PROJECT_PATH/.env" "$REMOTE_TEMP_DIR/.env.backup"
fi

rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"
tar -xzf "$REMOTE_ARCHIVE_PATH" -C "$STAGING_DIR"
chown -R "$VM_USER:$VM_GROUP" "$STAGING_DIR"

rm -rf "$BACKUP_DIR"
if [ -d "$REMOTE_PROJECT_PATH" ]; then
    mv "$REMOTE_PROJECT_PATH" "$BACKUP_DIR"
fi
mv "$STAGING_DIR" "$REMOTE_PROJECT_PATH"
SWAP_COMPLETED="true"

if [ -f "$REMOTE_TEMP_DIR/.env.backup" ]; then
    cp "$REMOTE_TEMP_DIR/.env.backup" "$REMOTE_PROJECT_PATH/.env"
    chown "$VM_USER:$VM_GROUP" "$REMOTE_PROJECT_PATH/.env"
    chmod 600 "$REMOTE_PROJECT_PATH/.env"
fi

cd "$REMOTE_PROJECT_PATH"
chmod +x deploy/oci/*.sh || true

bash deploy/oci/setup_vm.sh || fail_deploy "Falha ao preparar a VM para o deploy."

# Gera .env somente na primeira execução. Em atualizações, preserva integralmente o arquivo atual.
if [ ! -f "$REMOTE_PROJECT_PATH/.env" ]; then
    APP_DIR="$REMOTE_PROJECT_PATH" DOMAIN="$DOMAIN" bash deploy/oci/remote_prepare_env.sh
fi

print_logs_on_failure() {
    echo "=== docker compose ps ==="
    docker compose -f docker-compose.oci.yml ps || true
    echo "=== gmp-backend health (inspect) ==="
    docker inspect gmp-backend --format 'status={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' || true
    docker inspect gmp-backend --format '{{if .State.Health}}{{range .State.Health.Log}}{{.End}} exit={{.ExitCode}} output={{printf "%q" .Output}}{{"\n"}}{{end}}{{else}}no-healthcheck-log{{end}}' || true
    echo "=== gmp-backend logs (tail 200) ==="
    docker logs --tail=200 gmp-backend || true
    echo "=== gmp-frontend logs (tail 120) ==="
    docker logs --tail=120 gmp-frontend || true
    echo "=== gmp-nginx logs (tail 120) ==="
    docker logs --tail=120 gmp-nginx || true
    echo "=== gmp-postgres logs (tail 120) ==="
    docker logs --tail=120 gmp-postgres || true
    echo "=== gmp-redis logs (tail 120) ==="
    docker logs --tail=120 gmp-redis || true
}

wait_container_healthy() {
    local container_name="$1"
    local max_wait="${2:-180}"
    local waited=0
    while true; do
        status="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_name" 2>/dev/null || echo "unknown")"
        if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
            echo "$container_name saudavel"
            return 0
        fi
        if [ "$status" = "unhealthy" ] || [ "$status" = "exited" ] || [ "$status" = "dead" ]; then
            echo "$container_name ficou em estado $status"
            return 1
        fi
        sleep 5
        waited=$((waited + 5))
        if [ $waited -ge $max_wait ]; then
            echo "timeout aguardando $container_name ficar healthy"
            return 1
        fi
    done
}

wait_backend_healthy() {
    local max_wait=180
    local waited=0
    while true; do
        status="$(docker inspect --format='{{.State.Health.Status}}' gmp-backend 2>/dev/null || echo "unknown")"
        if [ "$status" = "healthy" ]; then
            echo "gmp-backend saudavel"
            return 0
        fi
        if [ "$status" = "unhealthy" ]; then
            echo "gmp-backend ficou unhealthy"
            return 1
        fi
        sleep 5
        waited=$((waited + 5))
        if [ $waited -ge $max_wait ]; then
            echo "timeout aguardando gmp-backend ficar healthy"
            return 1
        fi
    done
}

wait_http_ok() {
    local label="$1"
    local url="$2"
    local host_header="${3:-}"
    local max_wait="${4:-120}"
    local waited=0
    local code

    while true; do
        if [ -n "$host_header" ]; then
            code="$(curl -s -o /tmp/gmp-healthcheck.out -w '%{http_code}' -H "Host: $host_header" "$url" || true)"
        else
            code="$(curl -s -o /tmp/gmp-healthcheck.out -w '%{http_code}' "$url" || true)"
        fi

        if [[ "$code" =~ ^2 ]]; then
            echo "$label respondendo com HTTP $code"
            return 0
        fi

        sleep 5
        waited=$((waited + 5))
        if [ $waited -ge $max_wait ]; then
            echo "timeout aguardando $label responder com HTTP 2xx (ultimo codigo: $code)"
            return 1
        fi
    done
}

reconcile_postgres_credentials() {
    set -a
    . "$REMOTE_PROJECT_PATH/.env"
    set +a

    local sql_password
    sql_password="$(printf "%s" "$DATABASE_PASSWORD" | sed "s/'/''/g")"

    docker exec gmp-postgres sh -lc "psql -v ON_ERROR_STOP=1 -U \"$DATABASE_USER\" -d \"$DATABASE_NAME\" -c \"ALTER USER \\\"$DATABASE_USER\\\" WITH PASSWORD '$sql_password';\""
}

docker compose -f docker-compose.oci.yml up -d postgres redis || {
    fail_deploy "Falha ao subir postgres e redis."
}

wait_container_healthy gmp-postgres || {
    fail_deploy "Postgres nao ficou saudavel."
}

wait_container_healthy gmp-redis || {
    fail_deploy "Redis nao ficou saudavel."
}

reconcile_postgres_credentials || {
    fail_deploy "Falha ao reconciliar credenciais do Postgres com o .env remoto."
}

docker compose -f docker-compose.oci.yml up -d --build backend || {
    fail_deploy "Falha ao subir o backend."
}

wait_backend_healthy || {
    fail_deploy "Backend nao ficou saudavel apos o deploy."
}

if [ "$RUN_MIGRATIONS" = "true" ]; then
    docker exec gmp-backend sh -c 'cd /app/apps/backend && npx prisma migrate deploy --schema=prisma/schema.prisma' || fail_deploy "Falha ao executar migrations em producao."
else
    echo "Migrations desabilitadas neste deploy."
fi

docker compose -f docker-compose.oci.yml up -d --build frontend || {
    fail_deploy "Falha ao subir o frontend."
}

docker compose -f docker-compose.oci.yml up -d --no-deps --force-recreate nginx || {
    fail_deploy "Falha ao recriar o nginx da aplicacao."
}

if [ "$CONFIGURE_HOST_NGINX" = "true" ]; then
    if [ -n "$HOST_NGINX_EMAIL" ]; then
        bash deploy/oci/setup_host_nginx_gmp.sh --email "$HOST_NGINX_EMAIL" || fail_deploy "Falha ao configurar o host nginx do GMP."
    else
        bash deploy/oci/setup_host_nginx_gmp.sh || fail_deploy "Falha ao configurar o host nginx do GMP."
    fi
else
    echo "Configuracao do host nginx desabilitada neste deploy."
fi

wait_http_ok "Health interno do stack" "http://127.0.0.1:8081/health" "" 120 || fail_deploy "Health interno do stack falhou em 127.0.0.1:8081."
wait_http_ok "Health via host nginx local" "http://127.0.0.1/health" "$DOMAIN" 120 || fail_deploy "Health via host nginx local falhou."

if [ "$FAIL_ON_EXTERNAL_HTTPS_CHECK" = "true" ]; then
    curl -k -fsS "https://$DOMAIN/" >/dev/null || fail_deploy "Validacao HTTPS externa falhou."
else
    curl -k -fsS "https://$DOMAIN/" >/dev/null || echo "Validacao HTTPS externa falhou, mas o deploy nao sera abortado por isso."
fi

echo "Deploy PROD HTTPS concluido com sucesso em $DOMAIN"
'@

$bootstrapScript = $bootstrapTemplate.Replace('__REMOTE_PROJECT_PATH__', $RemoteProjectPath)
$bootstrapScript = $bootstrapScript.Replace('__REMOTE_TEMP_DIR__', $RemoteTempDir)
$bootstrapScript = $bootstrapScript.Replace('__REMOTE_ARCHIVE_PATH__', $remoteArchivePath)
$bootstrapScript = $bootstrapScript.Replace('__DOMAIN__', $Domain)
$bootstrapScript = $bootstrapScript.Replace('__VM_USER__', $VmUser)
$bootstrapScript = $bootstrapScript.Replace('__RUN_MIGRATIONS__', $runMigrationsFlag)
$bootstrapScript = $bootstrapScript.Replace('__CONFIGURE_HOST_NGINX__', $configureHostNginxFlag)
$bootstrapScript = $bootstrapScript.Replace('__FAIL_ON_EXTERNAL_HTTPS_CHECK__', $failOnExternalHttpsCheckFlag)
$hostNginxEmailValue = if ($null -ne $HostNginxEmail) { $HostNginxEmail } else { '' }
$bootstrapScript = $bootstrapScript.Replace('__HOST_NGINX_EMAIL__', $hostNginxEmailValue)

$bootstrapScript = $bootstrapScript -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($bootstrapLocalPath, $bootstrapScript, [System.Text.ASCIIEncoding]::new())

if (-not $Execute) {
    Write-Section "Modo seguro"
    Write-Host "Nenhuma conexao SSH foi aberta e nenhum deploy foi executado." -ForegroundColor Yellow
    Write-Host "Arquivo compactado preparado em: $archivePath" -ForegroundColor Yellow
    Write-Host "Bootstrap remoto preparado em: $bootstrapLocalPath" -ForegroundColor Yellow
    Write-Host "Esse fluxo preserva o .env remoto e nao remove volumes Docker de banco/redis/uploads." -ForegroundColor Yellow
    Write-Host "A versao anterior da aplicacao fica preservada em ${RemoteProjectPath}.previous apos a troca." -ForegroundColor Yellow
    Write-Host "Migrations padrao: desabilitadas. ConfigureHostNginx padrao: desabilitado." -ForegroundColor Yellow
    Write-Host "Quando autorizar, execute o script com o parametro -Execute." -ForegroundColor Yellow
    return
}

Ensure-ModuleInstalled -ModuleName "Posh-SSH"
Import-Module Posh-SSH

if (-not $Password -and -not [string]::IsNullOrWhiteSpace($PlainTextPassword)) {
    $Password = Convert-PlainTextToSecureString -Text $PlainTextPassword
}

if (-not $Password -and -not [string]::IsNullOrWhiteSpace($env:GMP_PROD_VM_PASSWORD)) {
    $Password = Convert-PlainTextToSecureString -Text $env:GMP_PROD_VM_PASSWORD
}

if (-not $Password) {
    $Password = Read-Host "Senha do usuario $VmUser@$VmHost" -AsSecureString
}

$plainPassword = Convert-SecureStringToPlainText -SecureValue $Password
$credential = [pscredential]::new($VmUser, $Password)

Write-Section "Conectando na VM"
$sshSession = New-SSHSession -ComputerName $VmHost -Credential $credential -AcceptKey
$sftpSession = New-SFTPSession -ComputerName $VmHost -Credential $credential -AcceptKey

try {
    Write-Section "Preparando diretorio remoto"
    $prepCommand = "mkdir -p '$RemoteTempDir'"
    $prepResult = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command $prepCommand
    if ($prepResult.ExitStatus -ne 0) {
        throw ($prepResult.Error -join [Environment]::NewLine)
    }

    Write-Section "Enviando pacote e bootstrap"
    Send-RemoteFile -SessionId $sftpSession.SessionId -LocalFile $archivePath -RemotePath $remoteArchivePath
    Send-RemoteFile -SessionId $sftpSession.SessionId -LocalFile $bootstrapLocalPath -RemotePath "$RemoteTempDir/bootstrap_prod_https.sh"

    Write-Section "Comando remoto que sera executado quando autorizado"
    $escapedPassword = Escape-BashSingleQuotedString -Text $plainPassword
    $remoteScriptPath = "$RemoteTempDir/bootstrap_prod_https.sh"
    $remoteCommandTemplate = @'
printf '%s\n' '__PASSWORD__' | sudo -S sh -c "sed -i 's/\r$//' '__SCRIPT__' && chmod +x '__SCRIPT__' && /bin/bash '__SCRIPT__'"
'@
    $remoteCommand = $remoteCommandTemplate.Replace('__PASSWORD__', $escapedPassword).Replace('__SCRIPT__', $remoteScriptPath).Trim()
    Write-Host $remoteCommand -ForegroundColor Yellow

    Write-Section "Execucao remota"
    $execResult = Invoke-SSHCommand -SessionId $sshSession.SessionId -Command $remoteCommand -TimeOut 3600000
    if ($execResult.Output) {
        $execResult.Output | ForEach-Object { Write-Host $_ }
    }
    if ($execResult.ExitStatus -ne 0) {
        if ($execResult.Error) {
            $execResult.Error | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        }
        throw "Deploy remoto falhou com exit code $($execResult.ExitStatus)"
    }

    if (-not $KeepRemoteArchive) {
        Write-Section "Limpando arquivos temporarios remotos"
        Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "rm -f '$remoteArchivePath' '$RemoteTempDir/bootstrap_prod_https.sh'"
    }

    Write-Section "Concluido"
    Write-Host "Aplicacao esperada em: https://$Domain" -ForegroundColor Green
    Write-Host "Health interno do stack: http://127.0.0.1:8081/health" -ForegroundColor Green
    Write-Host "Health via host nginx local: http://127.0.0.1/health com Host: $Domain" -ForegroundColor Green
}
finally {
    if ($sftpSession) {
        Remove-SFTPSession -SFTPSession $sftpSession | Out-Null
    }
    if ($sshSession) {
        Remove-SSHSession -SSHSession $sshSession | Out-Null
    }
}