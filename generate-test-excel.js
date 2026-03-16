// Script para gerar arquivo Excel de teste
const XLSX = require('xlsx');
const fs = require('fs');

// Dados válidos para importação
const data = [
  ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
  ['123e4567-e89b-12d3-a456-426614174000', 'facilities', 'Limpeza do escritório', '1500.50', '3', '2024'],
  ['123e4567-e89b-12d3-a456-426614174000', 'fornecedor', 'Materiais de expediente', '2500.00', '3', '2024'],
  ['123e4567-e89b-12d3-a456-426614174001', 'aluguel', 'Aluguel do espaço comercial', '5000.00', '3', '2024'],
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Despesas');

const outputPath = 'c:\\des\\gestor_multiprojetos\\despesas_teste.xlsx';
const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
fs.writeFileSync(outputPath, buffer);

console.log(`✓ Arquivo criado: ${outputPath}`);
console.log(`Tamanho: ${fs.statSync(outputPath).size} bytes`);
