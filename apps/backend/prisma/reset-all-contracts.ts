/**
 * Script COMPLETO para resetar todas as tabelas do módulo de contratos
 * Uso: npx ts-node prisma/reset-all-contracts.ts
 * 
 * ⚠️  PERIGO: Deleta TODOS os dados de:
 * - Projetos
 * - Receitas Mensais
 * - Linhas Contratuais
 * - Objetos Contratuais
 * - Contratos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAllContractData() {
  console.log('🔥 Iniciando RESET COMPLETO do módulo de contratos...\n');

  try {
    // Ordem de deleção respeita dependências (do mais dependente ao menos)
    
    // 1. Receitas Mensais (dependem de LinhaContratual + Project)
    const deletedReceitas = await prisma.receitaMensal.deleteMany({});
    console.log(`✅ ${deletedReceitas.count} receitas mensais deletadas`);

    // 2. Projetos (dependem de Contrato)
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(`✅ ${deletedProjects.count} projetos deletados`);

    // 3. Linhas Contratuais (dependem de ObjetoContratual)
    const deletedLinhas = await prisma.linhaContratual.deleteMany({});
    console.log(`✅ ${deletedLinhas.count} linhas contratuais deletadas`);

    // 4. Objetos Contratuais (dependem de Contrato)
    const deletedObjetos = await prisma.objetoContratual.deleteMany({});
    console.log(`✅ ${deletedObjetos.count} objetos contratuais deletados`);

    // 5. Contratos (raiz da hierarquia)
    const deletedContratos = await prisma.contrato.deleteMany({});
    console.log(`✅ ${deletedContratos.count} contratos deletados`);

    // 6. Verificar contagem final
    console.log('\n📊 Verificação final:');
    const counts = {
      contratos: await prisma.contrato.count(),
      objetos: await prisma.objetoContratual.count(),
      linhas: await prisma.linhaContratual.count(),
      projetos: await prisma.project.count(),
      receitas: await prisma.receitaMensal.count(),
    };

    console.log(`   Contratos: ${counts.contratos}`);
    console.log(`   Objetos: ${counts.objetos}`);
    console.log(`   Linhas: ${counts.linhas}`);
    console.log(`   Projetos: ${counts.projetos}`);
    console.log(`   Receitas: ${counts.receitas}`);

    const totalRemaining = Object.values(counts).reduce((a, b) => a + b, 0);
    
    if (totalRemaining === 0) {
      console.log('\n✅ BANCO DE DADOS RESETADO COM SUCESSO!');
      console.log('   Todos os dados de contratos foram removidos.');
      console.log('\n💡 Próximos passos:');
      console.log('   1. Reinicie o backend: docker compose restart backend');
      console.log('   2. Execute o seed: npx prisma db seed');
      console.log('   3. Acesse /contratos no frontend e crie um novo contrato');
    } else {
      console.warn(`\n⚠️  ${totalRemaining} registros ainda permanecem no banco`);
    }

  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Confirmação de segurança DUPLA
console.log('🚨 ATENÇÃO: Este script irá DELETAR PERMANENTEMENTE:\n');
console.log('   ❌ TODOS os Contratos');
console.log('   ❌ TODOS os Objetos Contratuais');
console.log('   ❌ TODAS as Linhas Contratuais');
console.log('   ❌ TODOS os Projetos');
console.log('   ❌ TODAS as Receitas Mensais');
console.log('\n⚠️  ESTA AÇÃO NÃO PODE SER DESFEITA!\n');
console.log('Pressione CTRL+C para CANCELAR');
console.log('Aguardando 8 segundos para continuar...\n');

let countdown = 8;
const interval = setInterval(() => {
  countdown--;
  if (countdown > 0) {
    console.log(`   ${countdown}...`);
  } else {
    clearInterval(interval);
  }
}, 1000);

setTimeout(() => {
  clearInterval(interval);
  console.log('\n🔥 Iniciando deleção...\n');
  
  resetAllContractData()
    .then(() => {
      console.log('\n✨ Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha na execução:', error);
      process.exit(1);
    });
}, 8000);
