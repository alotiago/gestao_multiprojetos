# Script de teste para upload de arquivo Excel

# Fazer login e obter token
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/auth/login' -ContentType 'application/json' -Body '{"email":"admin@sistema.com","password":"Admin123!"}'
$token = $login.accessToken
Write-Host "✓ Token obtido"

# Definir arquivo de teste (vamos usar template_final.xlsx que já foi criado)
$filePath = "c:\des\gestor_multiprojetos\template_final.xlsx"

# Criar body multipart manualmente usando .NET
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$body = ([System.Text.Encoding]::UTF8.GetBytes(
    "--$boundary$LF" +
    "Content-Disposition: form-data; name=`"file`"; filename=`"template_final.xlsx`"$LF" +
    "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet$LF$LF"
)) + (Get-Content -Path $filePath -Encoding Byte) + ([System.Text.Encoding]::UTF8.GetBytes("$LF--$boundary--$LF"))

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/financial/despesas/upload" `
        -Method Post `
        -Headers $headers `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✓ Upload realizado com sucesso!"
    Write-Host "Status: $($response.StatusCode)"
    $result = $response.Content | ConvertFrom-Json
    $result | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "✗ Erro: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}
