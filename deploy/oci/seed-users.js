const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const users = [
    { email: 'admin@sistema.com', password: hashedPassword, name: 'Administrador Sistema', role: 'ADMIN', ativo: true },
    { email: 'pmo@sistema.com', password: hashedPassword, name: 'Gerenciador PMO', role: 'PMO', ativo: true },
    { email: 'pm@sistema.com', password: hashedPassword, name: 'Gerente Projeto', role: 'PROJECT_MANAGER', ativo: true },
    { email: 'hr@sistema.com', password: hashedPassword, name: 'Gestor RH', role: 'HR', ativo: true },
    { email: 'finance@sistema.com', password: hashedPassword, name: 'Analista Financeiro', role: 'FINANCE', ativo: true },
    { email: 'viewer@sistema.com', password: hashedPassword, name: 'Leitor Sistema', role: 'VIEWER', ativo: true },
  ];

  await prisma.user.deleteMany();
  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  console.log('SEED_OK users=' + users.length);
}

main()
  .catch((error) => {
    console.error('SEED_ERROR', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
