param(
    [string]$VmHost = "10.10.11.93",
    [string]$Domain = "gestaodeprojetoshml.oais.cloud",
    [string]$VmUser = "gestor",
    [string]$LocalProjectPath = "C:\des\gestor_multiprojetos",
    [string]$RemoteProjectPath = "/opt/gestor_multiprojetos",
    [string]$RemoteTempDir = "/tmp/gmp-hml-deploy",
    [string]$ArchiveOutputDir = "$env:TEMP\gmp-hml-deploy",
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
    $archivePath = Join-Path $OutputDirectory "gestor_multiprojetos_hml_$timestamp.tar.gz"
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
$bootstrapLocalPath = Join-Path $ArchiveOutputDir "bootstrap_hml_http.sh"

$bootstrapTemplate = @'
#!/usr/bin/env bash
set -euo pipefail

REMOTE_PROJECT_PATH="__REMOTE_PROJECT_PATH__"
REMOTE_TEMP_DIR="__REMOTE_TEMP_DIR__"
REMOTE_ARCHIVE_PATH="__REMOTE_ARCHIVE_PATH__"
DOMAIN="__DOMAIN__"
VM_USER="__VM_USER__"
VM_GROUP="$(id -gn "$VM_USER" 2>/dev/null || echo "$VM_USER")"

mkdir -p "$REMOTE_TEMP_DIR"

# Preserva .env existente para manter credenciais consistentes com volumes persistentes.
if [ -f "$REMOTE_PROJECT_PATH/.env" ]; then
    cp "$REMOTE_PROJECT_PATH/.env" "$REMOTE_TEMP_DIR/.env.backup"
fi

rm -rf "$REMOTE_PROJECT_PATH"
mkdir -p "$REMOTE_PROJECT_PATH"
tar -xzf "$REMOTE_ARCHIVE_PATH" -C "$REMOTE_PROJECT_PATH"
chown -R "$VM_USER:$VM_GROUP" "$REMOTE_PROJECT_PATH"

if [ -f "$REMOTE_TEMP_DIR/.env.backup" ]; then
    cp "$REMOTE_TEMP_DIR/.env.backup" "$REMOTE_PROJECT_PATH/.env"
    chown "$VM_USER:$VM_GROUP" "$REMOTE_PROJECT_PATH/.env"
    chmod 600 "$REMOTE_PROJECT_PATH/.env"
fi

cd "$REMOTE_PROJECT_PATH"
chmod +x deploy/oci/*.sh || true

bash deploy/oci/setup_vm.sh

# Gera .env somente na primeira execução.
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

reconcile_postgres_credentials() {
    set -a
    . "$REMOTE_PROJECT_PATH/.env"
    set +a

    local sql_password
    sql_password="$(printf "%s" "$DATABASE_PASSWORD" | sed "s/'/''/g")"

    docker exec gmp-postgres sh -lc "psql -v ON_ERROR_STOP=1 -U \"$DATABASE_USER\" -d \"$DATABASE_NAME\" -c \"ALTER USER \\\"$DATABASE_USER\\\" WITH PASSWORD '$sql_password';\""
}

# Sobe primeiro a infra, reconcilia credenciais persistidas do Postgres e depois publica backend/frontend.
docker compose -f docker-compose.oci.yml up -d postgres redis || {
    print_logs_on_failure
    exit 1
}

wait_container_healthy gmp-postgres || {
    print_logs_on_failure
    exit 1
}

wait_container_healthy gmp-redis || {
    print_logs_on_failure
    exit 1
}

reconcile_postgres_credentials || {
    print_logs_on_failure
    exit 1
}

docker compose -f docker-compose.oci.yml up -d --build backend || {
    print_logs_on_failure
    exit 1
}

wait_backend_healthy || {
    print_logs_on_failure
    exit 1
}

docker exec gmp-backend sh -c 'cd /app/apps/backend && npx prisma migrate deploy --schema=prisma/schema.prisma'
docker compose -f docker-compose.oci.yml up -d --build frontend || {
    print_logs_on_failure
    exit 1
}

docker compose -f docker-compose.oci.yml up -d --no-deps --force-recreate nginx || {
    print_logs_on_failure
    exit 1
}

bash deploy/oci/setup_host_nginx_hml_http.sh --domain "$DOMAIN"

curl -fsS http://127.0.0.1:8081/health >/dev/null
curl -fsS -H "Host: $DOMAIN" http://127.0.0.1/health >/dev/null

echo "Deploy HML HTTP concluido com sucesso em $DOMAIN"
'@

$bootstrapScript = $bootstrapTemplate.Replace('__REMOTE_PROJECT_PATH__', $RemoteProjectPath)
$bootstrapScript = $bootstrapScript.Replace('__REMOTE_TEMP_DIR__', $RemoteTempDir)
$bootstrapScript = $bootstrapScript.Replace('__REMOTE_ARCHIVE_PATH__', $remoteArchivePath)
$bootstrapScript = $bootstrapScript.Replace('__DOMAIN__', $Domain)
$bootstrapScript = $bootstrapScript.Replace('__VM_USER__', $VmUser)

# Forca LF para evitar erro "set: pipefail" quando o script for executado no Linux.
$bootstrapScript = $bootstrapScript -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($bootstrapLocalPath, $bootstrapScript, [System.Text.ASCIIEncoding]::new())

if (-not $Execute) {
    Write-Section "Modo seguro"
    Write-Host "Nenhuma conexao SSH foi aberta e nenhum deploy foi executado." -ForegroundColor Yellow
    Write-Host "Arquivo compactado preparado em: $archivePath" -ForegroundColor Yellow
    Write-Host "Bootstrap remoto preparado em: $bootstrapLocalPath" -ForegroundColor Yellow
    Write-Host "Quando autorizar, execute o script com o parametro -Execute." -ForegroundColor Yellow
    return
}

Ensure-ModuleInstalled -ModuleName "Posh-SSH"
Import-Module Posh-SSH

if (-not $Password -and -not [string]::IsNullOrWhiteSpace($PlainTextPassword)) {
    $Password = Convert-PlainTextToSecureString -Text $PlainTextPassword
}

if (-not $Password -and -not [string]::IsNullOrWhiteSpace($env:GMP_HML_VM_PASSWORD)) {
    $Password = Convert-PlainTextToSecureString -Text $env:GMP_HML_VM_PASSWORD
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
    Send-RemoteFile -SessionId $sftpSession.SessionId -LocalFile $bootstrapLocalPath -RemotePath "$RemoteTempDir/bootstrap_hml_http.sh"

    Write-Section "Comando remoto que sera executado quando autorizado"
    $escapedPassword = Escape-BashSingleQuotedString -Text $plainPassword
    $remoteScriptPath = "$RemoteTempDir/bootstrap_hml_http.sh"
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
        Invoke-SSHCommand -SessionId $sshSession.SessionId -Command "rm -f '$remoteArchivePath' '$RemoteTempDir/bootstrap_hml_http.sh'"
    }

    Write-Section "Concluido"
    Write-Host "Aplicacao esperada em: http://$Domain" -ForegroundColor Green
    Write-Host "Health interno host nginx: http://$VmHost/health (com Host: $Domain)" -ForegroundColor Green
}
finally {
    if ($sftpSession) {
        Remove-SFTPSession -SFTPSession $sftpSession | Out-Null
    }
    if ($sshSession) {
        Remove-SSHSession -SSHSession $sshSession | Out-Null
    }
}