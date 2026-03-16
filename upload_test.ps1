$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/auth/login' -ContentType 'application/json' -Body '{"email":"admin@sistema.com","password":"Admin123!"}'
$token = $login.accessToken
Write-Host "Token obtido"

$filePath = "c:\des\gestor_multiprojetos\despesas_teste.xlsx"
$fileBytes = Get-Content -Path $filePath -Encoding Byte

$boundary = "----" + (New-Guid).Guid
$LF = "`r`n"

$bodyStart = ([System.Text.Encoding]::UTF8.GetBytes(
    "--$boundary$LF" +
    "Content-Disposition: form-data; name=""file""; filename=""despesas_teste.xlsx""$LF" +
    "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet$LF$LF"
))
$bodyEnd = ([System.Text.Encoding]::UTF8.GetBytes("$LF--$boundary--$LF"))

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
    
    Write-Host "Status: $($response.StatusCode)"
    $response.Content
} catch {
    Write-Host "Erro: StatusCode=$($_.Exception.Response.StatusCode)"
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host "Body: $body"
}
