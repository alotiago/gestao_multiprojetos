import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';
import { TipoDespesa } from '../dto/despesa.dto';
import { BulkDespesaItemDto } from '../dto/bulk-operations.dto';

export interface ExcelParseResult {
  items: BulkDespesaItemDto[];
  errors: Array<{ linha: number; coluna?: string; valor?: any; motivo: string; codigo: string }>;
  warnings: string[];
}

export class ExcelParser {
  private static readonly MAX_ROWS = 1000;
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly REQUIRED_COLUMNS = ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'];
  private static readonly VALID_TIPOS = Object.values(TipoDespesa);

  static parseExcel(buffer: Buffer, filename: string): ExcelParseResult {
    const result: ExcelParseResult = {
      items: [],
      errors: [],
      warnings: [],
    };

    // Validar tamanho do arquivo
    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new BadRequestException({
        codigo: 'E001',
        mensagem: 'Arquivo excede o tamanho máximo de 5MB',
      });
    }

    // Validar extensão
    const ext = filename.toLowerCase();
    if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls')) {
      throw new BadRequestException({
        codigo: 'E002',
        mensagem: 'Formato de arquivo inválido. Use .xlsx ou .xls',
      });
    }

    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch (error) {
      throw new BadRequestException({
        codigo: 'E003',
        mensagem: 'Não foi possível ler o arquivo Excel. Verifique se o arquivo não está corrompido.',
      });
    }

    // Verificar se a planilha "Despesas" existe
    if (!workbook.SheetNames.includes('Despesas')) {
      throw new BadRequestException({
        codigo: 'E002',
        mensagem: 'Planilha "Despesas" não encontrada. O template deve ter uma aba chamada "Despesas".',
      });
    }

    const worksheet = workbook.Sheets['Despesas'];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Validar se tem dados
    if (data.length < 2) {
      throw new BadRequestException({
        codigo: 'E004',
        mensagem: 'Arquivo vazio. Adicione pelo menos uma linha de dados.',
      });
    }

    // Pegar cabeçalhos (linha 1)
    const headers: string[] = data[0] as string[];
    
    // Validar colunas obrigatórias
    const missingColumns = this.REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new BadRequestException({
        codigo: 'E005',
        mensagem: `Colunas obrigatórias faltando: ${missingColumns.join(', ')}`,
      });
    }

    // Validar limite de linhas
    const dataRows = data.slice(1).filter(row => row && row.some(cell => cell !== undefined && cell !== ''));
    if (dataRows.length > this.MAX_ROWS) {
      throw new BadRequestException({
        codigo: 'E003',
        mensagem: `Arquivo excede o limite de ${this.MAX_ROWS} linhas. Total encontrado: ${dataRows.length}`,
      });
    }

    // Processar cada linha
    const colIndexes = {
      projectId: headers.indexOf('projectId'),
      tipo: headers.indexOf('tipo'),
      descricao: headers.indexOf('descricao'),
      valor: headers.indexOf('valor'),
      mes: headers.indexOf('mes'),
      ano: headers.indexOf('ano'),
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const linhaNumero = i + 2; // +2 porque: +1 para 1-indexed, +1 para pular cabeçalho

      // Pular linhas completamente vazias
      if (!row || row.every(cell => cell === undefined || cell === '' || cell === null)) {
        continue;
      }

      const item: Partial<BulkDespesaItemDto> = {};
      const rowErrors: typeof result.errors = [];

      // projectId
      const projectId = row[colIndexes.projectId];
      if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'projectId',
          valor: projectId,
          motivo: 'projectId é obrigatório e deve ser um UUID válido',
          codigo: 'E004',
        });
      } else {
        item.projectId = projectId.trim();
      }

      // tipo
      const tipo = row[colIndexes.tipo];
      if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'tipo',
          valor: tipo,
          motivo: 'tipo é obrigatório',
          codigo: 'E005',
        });
      } else if (!this.VALID_TIPOS.includes(tipo.trim().toLowerCase() as TipoDespesa)) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'tipo',
          valor: tipo,
          motivo: `Tipo de despesa inválido. Use: ${this.VALID_TIPOS.join(', ')}`,
          codigo: 'E005',
        });
      } else {
        item.tipo = tipo.trim().toLowerCase() as TipoDespesa;
      }

      // descricao
      const descricao = row[colIndexes.descricao];
      if (!descricao || typeof descricao !== 'string' || descricao.trim() === '') {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'descricao',
          valor: descricao,
          motivo: 'Descrição é obrigatória',
          codigo: 'E009',
        });
      } else if (descricao.trim().length > 255) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'descricao',
          valor: descricao,
          motivo: 'Descrição não pode ter mais de 255 caracteres',
          codigo: 'E009',
        });
      } else {
        item.descricao = descricao.trim();
      }

      // valor
      const valor = row[colIndexes.valor];
      const valorNumerico = typeof valor === 'number' ? valor : parseFloat(String(valor || '').replace(',', '.'));
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'valor',
          valor: valor,
          motivo: 'Valor deve ser maior que zero',
          codigo: 'E006',
        });
      } else {
        item.valor = Math.round(valorNumerico * 100) / 100; // 2 casas decimais
      }

      // mes
      const mes = row[colIndexes.mes];
      const mesNumerico = typeof mes === 'number' ? mes : parseInt(String(mes || ''));
      if (isNaN(mesNumerico) || mesNumerico < 1 || mesNumerico > 12) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'mes',
          valor: mes,
          motivo: 'Mês deve estar entre 1 e 12',
          codigo: 'E007',
        });
      } else {
        item.mes = mesNumerico;
      }

      // ano
      const ano = row[colIndexes.ano];
      const anoNumerico = typeof ano === 'number' ? ano : parseInt(String(ano || ''));
      if (isNaN(anoNumerico) || anoNumerico < 2020 || anoNumerico > 2100) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'ano',
          valor: ano,
          motivo: 'Ano deve estar entre 2020 e 2100',
          codigo: 'E008',
        });
      } else {
        item.ano = anoNumerico;
      }

      // Se tem erros, adicionar à lista de erros
      if (rowErrors.length > 0) {
        result.errors.push(...rowErrors);
      } else {
        // Item válido, adicionar à lista
        result.items.push(item as BulkDespesaItemDto);
      }
    }

    // Adicionar warnings se houver
    if (result.errors.length > 0) {
      result.warnings.push(`${result.errors.length} linha(s) com erros foram ignoradas`);
    }

    return result;
  }

  static generateTemplate(): Buffer {
    // Criar workbook com exemplo
    const wb = XLSX.utils.book_new();
    
    const data = [
      ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
      [
        '550e8400-e29b-41d4-a716-446655440000',
        'facilities',
        'Limpeza e manutenção predial - Março',
        5000.00,
        3,
        2026
      ],
      [
        '550e8400-e29b-41d4-a716-446655440000',
        'fornecedor',
        'Licenças de software',
        12500.75,
        3,
        2026
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Definir largura das colunas
    ws['!cols'] = [
      { wch: 40 }, // projectId
      { wch: 15 }, // tipo
      { wch: 50 }, // descricao
      { wch: 12 }, // valor
      { wch: 6 },  // mes
      { wch: 6 },  // ano
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Despesas');

    // Gerar buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
