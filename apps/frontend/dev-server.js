#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const DEFAULT_PORT = 3000;

// Tenta portas sequencialmente se a padrão estiver ocupada
async function findAvailablePort(startPort = DEFAULT_PORT) {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        resolve(startPort);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(startPort);
    });
    
    server.listen(startPort);
  });
}

(async () => {
  const availablePort = await findAvailablePort(DEFAULT_PORT);
  console.log(`\n📎 Iniciando Next.js na porta ${availablePort}...\n`);
  
  if (availablePort !== DEFAULT_PORT) {
    console.warn(`⚠️  Porta 3000 estava ocupada, usando ${availablePort} em vez disso\n`);
  }
  
  const child = spawn('npx', ['next', 'dev', '-p', String(availablePort)], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });
  
  process.on('signal', () => {
    child.kill();
    process.exit();
  });
})();
