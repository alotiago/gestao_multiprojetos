/**
 * Script para zerar a tabela de projetos e dados relacionados
 * Uso: npx ts-node prisma/reset-projects.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetProjects() {
  console.log('🗑️  Iniciando limpeza da tabela de projetos...\n');

  try {
    // 1. Deletar receitas mensais (dependência de projetos)
    const deletedReceitas = await prisma.receitaMensal.deleteMany({});
    console.log(`✅ ${deletedReceitas.count} receitas mensais deletadas`);

    // 2. Deletar projetos
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(`✅ ${deletedProjects.count} projetos deletados`);

    // 3. Verificar contagem final
    const remainingProjects = await prisma.project.count();
    const remainingReceitas = await prisma.receitaMensal.count();

    console.log('\n📊 Status final:');
    console.log(`   Projetos restantes: ${remainingProjects}`);
    console.log(`   Receitas restantes: ${remainingReceitas}`);

    if (remainingProjects === 0 && remainingReceitas === 0) {
      console.log('\n✅ Tabela de projetos zerada com sucesso!');
    } else {
      console.warn('\n⚠️  Alguns registros ainda permanecem no banco');
    }

  } catch (error) {
    console.error('❌ Erro ao limpar tabela de projetos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Confirmação de segurança
console.log('⚠️  ATENÇÃO: Este script irá DELETAR TODOS OS PROJETOS do banco de dados!\n');
console.log('Pressione CTRL+C para cancelar ou aguarde 5 segundos para continuar...\n');

setTimeout(() => {
  resetProjects()
    .then(() => {
      console.log('\n✨ Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha na execução:', error);
      process.exit(1);
    });
}, 5000);
