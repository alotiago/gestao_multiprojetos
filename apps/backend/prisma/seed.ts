import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de dados...\n');

  // 1. Limpar dados existentes
  console.log('Limpando dados existentes...');
  await prisma.user.deleteMany();
  console.log('Dados antigos removidos\n');

  // 2. Criar usuários de teste
  console.log('Criando usuários de teste...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const users = [
    { email: 'admin@sistema.com', password: hashedPassword, name: 'Administrador Sistema', role: UserRole.ADMIN, ativo: true },
    { email: 'pmo@sistema.com', password: hashedPassword, name: 'Gerenciador PMO', role: UserRole.PMO, ativo: true },
    { email: 'pm@sistema.com', password: hashedPassword, name: 'Gerente Projeto', role: UserRole.PROJECT_MANAGER, ativo: true },
    { email: 'hr@sistema.com', password: hashedPassword, name: 'Gestor RH', role: UserRole.HR, ativo: true },
    { email: 'finance@sistema.com', password: hashedPassword, name: 'Analista Financeiro', role: UserRole.FINANCE, ativo: true },
    { email: 'viewer@sistema.com', password: hashedPassword, name: 'Leitor Sistema', role: UserRole.VIEWER, ativo: true },
  ];

  for (const user of users) {
    const createdUser = await prisma.user.create({ data: user });
    console.log(`  [OK] Usuario criado: ${createdUser.email} (${createdUser.role})`);
  }

  console.log('\n[OK] Seed completo!');
  console.log('\nCredenciais de teste:');
  console.log('  admin@sistema.com / Admin123!     (ADMIN)');
  console.log('  pmo@sistema.com   / Admin123!     (PMO)');
  console.log('  pm@sistema.com    / Admin123!     (PROJECT_MANAGER)');
  console.log('  hr@sistema.com    / Admin123!     (HR)');
  console.log('  finance@sistema.com / Admin123!   (FINANCE)');
  console.log('  viewer@sistema.com  / Admin123!   (VIEWER)');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
