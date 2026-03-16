import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

interface FeriadoSeed {
  data: Date;
  nome: string;
  descricao: string;
  tipoFeriado: string;
  estado?: string;
  cidade?: string;
  ehFeriado: boolean;
  ehRecuperavel: boolean;
  percentualDesc: number;
  observacoes: string;
}

// Feriados Nacionais com novos campos completos
const feriadosNacionais2026 = [
  {
    data: new Date('2026-01-01'),
    nome: 'Confraternização Universal',
    descricao: 'Ano Novo - Confraternização Universal',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2026-02-16'),
    nome: 'Carnaval (Segunda)',
    descricao: 'Carnaval - Segunda-feira',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Ponto facultativo nacional - data móvel',
  },
  {
    data: new Date('2026-02-17'),
    nome: 'Carnaval',
    descricao: 'Carnaval - Terça-feira',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Ponto facultativo nacional - data móvel',
  },
  {
    data: new Date('2026-02-18'),
    nome: 'Quarta de Cinzas',
    descricao: 'Quarta-feira de Cinzas',
    tipoFeriado: 'NACIONAL',
    ehFeriado: false,
    ehRecuperavel: true,
    percentualDesc: 50,
    observacoes: 'Ponto facultativo até 14h - data móvel',
  },
  {
    data: new Date('2026-04-03'),
    nome: 'Sexta-feira Santa',
    descricao: 'Paixão de Cristo',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional - data móvel (Páscoa)',
  },
  {
    data: new Date('2026-04-21'),
    nome: 'Tiradentes',
    descricao: 'Dia de Tiradentes',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2026-05-01'),
    nome: 'Dia do Trabalho',
    descricao: 'Dia Mundial do Trabalho',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2026-06-04'),
    nome: 'Corpus Christi',
    descricao: 'Corpus Christi',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional - data móvel',
  },
  {
    data: new Date('2026-09-07'),
    nome: 'Independência do Brasil',
    descricao: 'Dia da Independência do Brasil',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2026-10-12'),
    nome: 'Nossa Senhora Aparecida',
    descricao: 'Nossa Senhora Aparecida - Padroeira do Brasil',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional fixo',
  },
  {
    data: new Date('2026-11-02'),
    nome: 'Finados',
    descricao: 'Dia de Finados',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2026-11-15'),
    nome: 'Proclamação da República',
    descricao: 'Proclamação da República',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2026-11-20'),
    nome: 'Consciência Negra',
    descricao: 'Dia da Consciência Negra',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional a partir de 2024',
  },
  {
    data: new Date('2026-12-25'),
    nome: 'Natal',
    descricao: 'Natal',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional fixo',
  },
];

const feriadosNacionais2027 = [
  {
    data: new Date('2027-01-01'),
    nome: 'Confraternização Universal',
    descricao: 'Ano Novo - Confraternização Universal',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2027-02-08'),
    nome: 'Carnaval (Segunda)',
    descricao: 'Carnaval - Segunda-feira',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Ponto facultativo nacional - data móvel',
  },
  {
    data: new Date('2027-02-09'),
    nome: 'Carnaval',
    descricao: 'Carnaval - Terça-feira',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Ponto facultativo nacional - data móvel',
  },
  {
    data: new Date('2027-02-10'),
    nome: 'Quarta de Cinzas',
    descricao: 'Quarta-feira de Cinzas',
    tipoFeriado: 'NACIONAL',
    ehFeriado: false,
    ehRecuperavel: true,
    percentualDesc: 50,
    observacoes: 'Ponto facultativo até 14h - data móvel',
  },
  {
    data: new Date('2027-03-26'),
    nome: 'Sexta-feira Santa',
    descricao: 'Paixão de Cristo',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional - data móvel (Páscoa)',
  },
  {
    data: new Date('2027-04-21'),
    nome: 'Tiradentes',
    descricao: 'Dia de Tiradentes',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2027-05-01'),
    nome: 'Dia do Trabalho',
    descricao: 'Dia Mundial do Trabalho',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2027-05-27'),
    nome: 'Corpus Christi',
    descricao: 'Corpus Christi',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional - data móvel',
  },
  {
    data: new Date('2027-09-07'),
    nome: 'Independência do Brasil',
    descricao: 'Dia da Independência do Brasil',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2027-10-12'),
    nome: 'Nossa Senhora Aparecida',
    descricao: 'Nossa Senhora Aparecida - Padroeira do Brasil',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional fixo',
  },
  {
    data: new Date('2027-11-02'),
    nome: 'Finados',
    descricao: 'Dia de Finados',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2027-11-15'),
    nome: 'Proclamação da República',
    descricao: 'Proclamação da República',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional fixo',
  },
  {
    data: new Date('2027-11-20'),
    nome: 'Consciência Negra',
    descricao: 'Dia da Consciência Negra',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado nacional a partir de 2024',
  },
  {
    data: new Date('2027-12-25'),
    nome: 'Natal',
    descricao: 'Natal',
    tipoFeriado: 'NACIONAL',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado religioso nacional fixo',
  },
];

// Feriados Estaduais (SP)
const feriadosEstaduaisSP2026 = [
  {
    data: new Date('2026-07-09'),
    nome: 'Revolução Constitucionalista',
    descricao: 'Revolução Constitucionalista de 1932',
    tipoFeriado: 'ESTADUAL',
    estado: 'SP',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado estadual SP',
  },
];

const feriadosEstaduaisSP2027 = [
  {
    data: new Date('2027-07-09'),
    nome: 'Revolução Constitucionalista',
    descricao: 'Revolução Constitucionalista de 1932',
    tipoFeriado: 'ESTADUAL',
    estado: 'SP',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado estadual SP',
  },
];

// Feriados Municipais (São Paulo Capital)
const feriadosMunicipaisSP2026 = [
  {
    data: new Date('2026-01-25'),
    nome: 'Aniversário de São Paulo',
    descricao: 'Aniversário da Cidade de São Paulo',
    tipoFeriado: 'MUNICIPAL',
    estado: 'SP',
    cidade: 'São Paulo',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado municipal - 473 anos em 2026',
  },
];

const feriadosMunicipaisSP2027 = [
  {
    data: new Date('2027-01-25'),
    nome: 'Aniversário de São Paulo',
    descricao: 'Aniversário da Cidade de São Paulo',
    tipoFeriado: 'MUNICIPAL',
    estado: 'SP',
    cidade: 'São Paulo',
    ehFeriado: true,
    ehRecuperavel: false,
    percentualDesc: 100,
    observacoes: 'Feriado municipal - 474 anos em 2027',
  },
];

async function seedFeriados() {
  console.log('🗓️  Iniciando seed de feriados 2026-2027...');

  const todosFeriados = [
    ...feriadosNacionais2026,
    ...feriadosNacionais2027,
    ...feriadosEstaduaisSP2026,
    ...feriadosEstaduaisSP2027,
    ...feriadosMunicipaisSP2026,
    ...feriadosMunicipaisSP2027,
  ];

  let criados = 0;
  let existentes = 0;
  let erros = 0;

  for (const feriado of todosFeriados) {
    try {
      const diaSemana = feriado.data.getDay();
      const nacional = feriado.tipoFeriado === 'NACIONAL';
      const feriadoAny = feriado as any;

      await prisma.calendario.create({
        data: {
          data: feriado.data,
          nome: feriado.nome,
          descricao: feriado.descricao,
          tipoFeriado: feriado.tipoFeriado as any,
          estado: feriadoAny.estado || null,
          cidade: feriadoAny.cidade || null,
          diaSemana,
          nacional,
          ehFeriado: feriado.ehFeriado,
          ehRecuperavel: feriado.ehRecuperavel,
          percentualDesc: new Decimal(feriado.percentualDesc),
          observacoes: feriado.observacoes,
        },
      });
      criados++;
      console.log(`✅ ${feriado.nome} (${feriado.data.toLocaleDateString('pt-BR')})`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        existentes++;
        console.log(`⚠️  ${feriado.nome} já existe`);
      } else {
        erros++;
        console.error(`❌ Erro ao criar ${feriado.nome}:`, error.message);
      }
    }
  }

  console.log('\n📊 Resumo do Seed:');
  console.log(`   Total processado: ${todosFeriados.length}`);
  console.log(`   ✅ Criados: ${criados}`);
  console.log(`   ⚠️  Já existiam: ${existentes}`);
  console.log(`   ❌ Erros: ${erros}`);

  return { total: todosFeriados.length, criados, existentes, erros };
}

async function main() {
  try {
    await seedFeriados();
    console.log('\n✅ Seed de feriados 2026-2027 concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedFeriados, feriadosNacionais2026, feriadosNacionais2027 };
