Write-Host "Testando endpoint de upload Excel"

$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/auth/login' -ContentType 'application/json' -Body '{"email":"admin@sistema.com","password":"Admin123!"}'
$token = $login.accessToken
Write-Host "✓ Token obtido"

$filePath = "c:\des\gestor_multiprojetos\despesas_teste.xlsx"
$fileBytes = Get-Content -Path $filePath -Encoding Byte
Write-Host "✓ Arquivo: $($fileBytes.Length) bytes"

$boundary = "----WebKitFormBoundary$((Get-Random 10000))"
$CRLF = "`r`n"

$bodyStart = ([System.Text.Encoding]::UTF8.GetBytes(
    "--$boundary$CRLF" +
    "Content-Disposition: form-data; name=""file""; filename=""despesas_teste.xlsx""$CRLF" +
    "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet$CRLF$CRLF"
))
$bodyEnd = ([System.Text.Encoding]::UTF8.GetBytes("$CRLF--$boundary--$CRLF"))
$body = $bodyStart + $fileBytes + $bodyEnd

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
    
    Write-Host "✓ Status: $($response.StatusCode)"
    Write-Host "`nResposta:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "✗ Erro: StatusCode=$($_.Exception.Response.StatusCode)"
}
