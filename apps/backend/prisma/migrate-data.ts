/**
 * Script de Migração de Dados — PR_SEEC_2026
 * 
 * Migra dados da planilha Excel PR_SEEC_2026 para o sistema Gestor Multiprojetos.
 * 
 * USO:
 *   1. Exporte cada aba da planilha como CSV (UTF-8)
 *   2. Coloque os CSVs na pasta apps/backend/data/
 *   3. Execute: npx ts-node prisma/migrate-data.ts
 * 
 * ARQUIVOS ESPERADOS:
 *   - data/projetos.csv      → Projetos e dados base
 *   - data/colaboradores.csv → Colaboradores e dados pessoais
 *   - data/jornadas.csv      → Jornadas por colaborador/mês
 *   - data/despesas.csv      → Despesas por projeto/mês
 *   - data/sindicatos.csv    → Sindicatos e regras
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/* ───── helpers ───── */

function parseCsv(filePath: string): Record<string, string>[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ Arquivo não encontrado: ${filePath} — pulando.`);
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

function toDecimal(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^\d.,\-]/g, '').replace(',', '.')) || 0;
}

function toDate(val: string): Date {
  if (!val) return new Date();
  // Suporta DD/MM/YYYY e YYYY-MM-DD
  if (val.includes('/')) {
    const [d, m, y] = val.split('/');
    return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
  }
  return new Date(val);
}

/* ───── migração principal ───── */

async function migrateProjects(dataDir: string): Promise<Map<string, string>> {
  const rows = parseCsv(path.join(dataDir, 'projetos.csv'));
  const idMap = new Map<string, string>();
  if (!rows.length) return idMap;

  console.log(`\n📁 Migrando ${rows.length} projetos...`);

  // Garantir que existe pelo menos uma unit
  let unit = await prisma.unit.findFirst();
  if (!unit) {
    unit = await prisma.unit.create({
      data: { code: 'SEEC', name: 'SEEC/PR', description: 'Secretaria de Estado da Educação' },
    });
  }

  let ok = 0, errors = 0;
  for (const row of rows) {
    try {
      const project = await prisma.project.upsert({
        where: { codigo: row.codigo || row.CODIGO || row.Código || '' },
        update: {
          nome: row.nome || row.NOME || row.Nome || 'Sem nome',
          cliente: row.cliente || row.CLIENTE || 'SEEC/PR',
          tipo: row.tipo || row.TIPO || 'serviço',
          dataInicio: toDate(row.dataInicio || row.DATA_INICIO || row['Data Início'] || '2026-01-01'),
          dataFim: row.dataFim || row.DATA_FIM ? toDate(row.dataFim || row.DATA_FIM || '') : undefined,
        },
        create: {
          codigo: row.codigo || row.CODIGO || row.Código || `PR_${ok + 1}`,
          nome: row.nome || row.NOME || row.Nome || 'Sem nome',
          cliente: row.cliente || row.CLIENTE || 'SEEC/PR',
          unitId: unit.id,
          tipo: row.tipo || row.TIPO || 'serviço',
          dataInicio: toDate(row.dataInicio || row.DATA_INICIO || row['Data Início'] || '2026-01-01'),
          dataFim: row.dataFim || row.DATA_FIM ? toDate(row.dataFim || row.DATA_FIM || '') : undefined,
        },
      });
      idMap.set(row.codigo || row.CODIGO || row.Código || '', project.id);
      ok++;
    } catch (e: any) {
      errors++;
      console.error(`  ✗ Projeto "${row.codigo}": ${e.message}`);
    }
  }
  console.log(`  ✓ ${ok} projetos migrados, ${errors} erros`);
  return idMap;
}

async function migrateSindicatos(dataDir: string): Promise<Map<string, string>> {
  const rows = parseCsv(path.join(dataDir, 'sindicatos.csv'));
  const idMap = new Map<string, string>();
  if (!rows.length) return idMap;

  console.log(`\n🏢 Migrando ${rows.length} sindicatos...`);

  let ok = 0, errors = 0;
  for (const row of rows) {
    try {
      const sindicato = await prisma.sindicato.upsert({
        where: { nome: row.nome || row.NOME || '' },
        update: {
          regiao: row.regiao || row.REGIAO || row.UF || 'PR',
          percentualDissidio: toDecimal(row.percentualDissidio || row.PERCENTUAL || '0'),
          regimeTributario: row.regime || row.REGIME || 'CPRB',
        },
        create: {
          nome: row.nome || row.NOME || `Sindicato ${ok + 1}`,
          regiao: row.regiao || row.REGIAO || row.UF || 'PR',
          percentualDissidio: toDecimal(row.percentualDissidio || row.PERCENTUAL || '0'),
          regimeTributario: row.regime || row.REGIME || 'CPRB',
        },
      });
      idMap.set(row.nome || row.NOME || '', sindicato.id);
      ok++;
    } catch (e: any) {
      errors++;
      console.error(`  ✗ Sindicato "${row.nome}": ${e.message}`);
    }
  }
  console.log(`  ✓ ${ok} sindicatos migrados, ${errors} erros`);
  return idMap;
}

async function migrateColaboradores(
  dataDir: string,
  sindicatoMap: Map<string, string>,
): Promise<Map<string, string>> {
  const rows = parseCsv(path.join(dataDir, 'colaboradores.csv'));
  const idMap = new Map<string, string>();
  if (!rows.length) return idMap;

  console.log(`\n👥 Migrando ${rows.length} colaboradores...`);

  let ok = 0, errors = 0;
  for (const row of rows) {
    try {
      const sindicatoNome = row.sindicato || row.SINDICATO || '';
      const sindicatoId = sindicatoMap.get(sindicatoNome) || null;

      const colaborador = await prisma.colaborador.upsert({
        where: { matricula: row.matricula || row.MATRICULA || '' },
        update: {
          nome: row.nome || row.NOME || 'Sem nome',
          cargo: row.cargo || row.CARGO || 'Analista',
          taxaHora: toDecimal(row.taxaHora || row.TAXA_HORA || row['Taxa Hora'] || '0'),
          cargaHoraria: parseInt(row.cargaHoraria || row.CARGA_HORARIA || '176') || 176,
          cidade: row.cidade || row.CIDADE || 'Curitiba',
          estado: row.estado || row.ESTADO || row.UF || 'PR',
          sindicatoId,
        },
        create: {
          matricula: row.matricula || row.MATRICULA || `MAT_${ok + 1}`,
          nome: row.nome || row.NOME || 'Sem nome',
          cargo: row.cargo || row.CARGO || 'Analista',
          taxaHora: toDecimal(row.taxaHora || row.TAXA_HORA || row['Taxa Hora'] || '0'),
          cargaHoraria: parseInt(row.cargaHoraria || row.CARGA_HORARIA || '176') || 176,
          cidade: row.cidade || row.CIDADE || 'Curitiba',
          estado: row.estado || row.ESTADO || row.UF || 'PR',
          dataAdmissao: toDate(row.dataAdmissao || row.DATA_ADMISSAO || row['Data Admissão'] || '2024-01-01'),
          sindicatoId,
        },
      });
      idMap.set(row.matricula || row.MATRICULA || '', colaborador.id);
      ok++;
    } catch (e: any) {
      errors++;
      console.error(`  ✗ Colaborador "${row.matricula}": ${e.message}`);
    }
  }
  console.log(`  ✓ ${ok} colaboradores migrados, ${errors} erros`);
  return idMap;
}

async function migrateJornadas(
  dataDir: string,
  colaboradorMap: Map<string, string>,
) {
  const rows = parseCsv(path.join(dataDir, 'jornadas.csv'));
  if (!rows.length) return;

  console.log(`\n📅 Migrando ${rows.length} jornadas...`);

  let ok = 0, errors = 0;
  for (const row of rows) {
    try {
      const matricula = row.matricula || row.MATRICULA || '';
      const colaboradorId = colaboradorMap.get(matricula);
      if (!colaboradorId) {
        console.warn(`  ⚠ Colaborador "${matricula}" não encontrado — pulando jornada.`);
        errors++;
        continue;
      }

      const mes = parseInt(row.mes || row.MES || '1');
      const ano = parseInt(row.ano || row.ANO || '2026');

      await prisma.jornada.upsert({
        where: {
          colaboradorId_mes_ano: { colaboradorId, mes, ano },
        },
        update: {
          horasPrevistas: toDecimal(row.horasPrevistas || row.HORAS_PREVISTAS || '176'),
          horasRealizadas: toDecimal(row.horasRealizadas || row.HORAS_REALIZADAS || '0'),
        },
        create: {
          colaboradorId,
          mes,
          ano,
          horasPrevistas: toDecimal(row.horasPrevistas || row.HORAS_PREVISTAS || '176'),
          horasRealizadas: toDecimal(row.horasRealizadas || row.HORAS_REALIZADAS || '0'),
        },
      });
      ok++;
    } catch (e: any) {
      errors++;
      console.error(`  ✗ Jornada: ${e.message}`);
    }
  }
  console.log(`  ✓ ${ok} jornadas migradas, ${errors} erros`);
}

async function migrateDespesas(
  dataDir: string,
  projectMap: Map<string, string>,
) {
  const rows = parseCsv(path.join(dataDir, 'despesas.csv'));
  if (!rows.length) return;

  console.log(`\n💰 Migrando ${rows.length} despesas...`);

  let ok = 0, errors = 0;
  for (const row of rows) {
    try {
      const codigo = row.projeto || row.PROJETO || row.codigo_projeto || '';
      const projectId = projectMap.get(codigo);
      if (!projectId) {
        console.warn(`  ⚠ Projeto "${codigo}" não encontrado — pulando despesa.`);
        errors++;
        continue;
      }

      await prisma.despesa.create({
        data: {
          projectId,
          tipo: row.tipo || row.TIPO || 'operacional',
          descricao: row.descricao || row.DESCRICAO || 'Despesa migrada',
          valor: toDecimal(row.valor || row.VALOR || '0'),
          mes: parseInt(row.mes || row.MES || '1'),
          ano: parseInt(row.ano || row.ANO || '2026'),
        },
      });
      ok++;
    } catch (e: any) {
      errors++;
      console.error(`  ✗ Despesa: ${e.message}`);
    }
  }
  console.log(`  ✓ ${ok} despesas migradas, ${errors} erros`);
}

/* ───── orquestração ───── */

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  MIGRAÇÃO DE DADOS — PR_SEEC_2026               ║');
  console.log('║  Gestor Multiprojetos                           ║');
  console.log('╚══════════════════════════════════════════════════╝');

  const dataDir = path.join(__dirname, '..', 'data');

  if (!fs.existsSync(dataDir)) {
    console.log(`\nCriando diretório de dados: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('\n⚠  Diretório apps/backend/data/ criado.');
    console.log('   Coloque os CSVs exportados da planilha neste diretório:');
    console.log('   - projetos.csv');
    console.log('   - colaboradores.csv');
    console.log('   - jornadas.csv');
    console.log('   - despesas.csv');
    console.log('   - sindicatos.csv');
    console.log('\n   Depois execute novamente: npx ts-node prisma/migrate-data.ts');
    return;
  }

  const start = Date.now();

  try {
    // 1. Sindicatos (sem dependências)
    const sindicatoMap = await migrateSindicatos(dataDir);

    // 2. Projetos (sem dependências)
    const projectMap = await migrateProjects(dataDir);

    // 3. Colaboradores (depende de sindicatos)
    const colaboradorMap = await migrateColaboradores(dataDir, sindicatoMap);

    // 4. Jornadas (depende de colaboradores)
    await migrateJornadas(dataDir, colaboradorMap);

    // 5. Despesas (depende de projetos)
    await migrateDespesas(dataDir, projectMap);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log(`║  ✅ MIGRAÇÃO CONCLUÍDA — ${elapsed}s                    ║`);
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Sindicatos:    ${sindicatoMap.size.toString().padStart(5)}`);
    console.log(`║  Projetos:      ${projectMap.size.toString().padStart(5)}`);
    console.log(`║  Colaboradores: ${colaboradorMap.size.toString().padStart(5)}`);
    console.log('╚══════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('\n❌ Erro fatal na migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
