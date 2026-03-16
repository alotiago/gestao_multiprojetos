# Script de teste para upload de arquivo Excel com dados válidos
Write-Host "Iniciando teste de upload com arquivo de dados..."

# Fazer login e obter token
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/auth/login' -ContentType 'application/json' -Body '{"email":"admin@sistema.com","password":"Admin123!"}'
$token = $login.accessToken
Write-Host "✓ Token obtido"

# Arquivo de teste com dados válidos
$filePath = "c:\des\gestor_multiprojetos\despesas_teste.xlsx"
Write-Host "✓ Arquivo: $filePath ($((Get-Item $filePath).Length) bytes)"

# Criar boundary
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Montar corpo multipart
$fileBytes = Get-Content -Path $filePath -Encoding Byte
$bodyStart = ([System.Text.Encoding]::UTF8.GetBytes(
    "--$boundary$LF" +
    "Content-Disposition: form-data; name=`"file`"; filename=`"despesas_teste.xlsx`"$LF" +
    "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet$LF$LF"
))
$bodyEnd = ([System.Text.Encoding]::UTF8.GetBytes("$LF--$boundary--$LF"))

$body = $bodyStart + $fileBytes + $bodyEnd

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    Write-Host "Enviando requisição POST para upload..."
    $response = Invoke-WebRequest -Uri "http://localhost:3001/financial/despesas/upload" `
        -Method Post `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✓ Status: $($response.StatusCode)"
    Write-Host "Resposta:"
    $result = $response.Content | ConvertFrom-Json
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
