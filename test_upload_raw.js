// Script para testar upload com raw buffer (sem FormData)
const fs = require('fs');
const path = require('path');
const http = require('http');

async function testUpload() {
  // Obter token
  const loginResponse = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sistema.com', password: 'Admin123!' }),
  });
  
  const { accessToken: token } = await loginResponse.json();
  console.log('✓ Token obtido');

  // Preparar arquivo
  const filePath = path.join(__dirname, 'despesas_teste.xlsx');
  const fileBuffer = fs.readFileSync(filePath);
  console.log(`✓ Arquivo: ${fileBuffer.length} bytes`);

  // Criar multipart manualmente
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2, 15);
  const CRLF = '\r\n';
  let body = '';

  body += `--${boundary}${CRLF}`;
  body += `Content-Disposition: form-data; name="file"; filename="despesas_teste.xlsx"${CRLF}`;
  body += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet${CRLF}${CRLF}`;

  const bodyStart = Buffer.from(body);
  const bodyEnd = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);
  const totalBody = Buffer.concat([bodyStart, fileBuffer, bodyEnd]);

  // Fazer upload
  try {
    const response = await fetch('http://localhost:3001/financial/despesas/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalBody.length,
      },
      body: totalBody,
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log('Resposta:', text);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testUpload();
