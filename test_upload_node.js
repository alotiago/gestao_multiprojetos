// Script para testar upload usando a API fetch do Node.js
const fs = require('fs');
const path = require('path');

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

  // Criar FormData
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', fileBuffer, 'despesas_teste.xlsx');

  // Fazer upload
  try {
    const response = await fetch('http://localhost:3001/financial/despesas/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log('Resposta:', text);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testUpload();
