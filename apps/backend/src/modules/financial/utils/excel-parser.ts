import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';
import { TipoDespesa, NaturezaCusto } from '../dto/despesa.dto';
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
  private static readonly HEADER_ALIASES: Record<string, string[]> = {
    projectId: ['projectid', 'project_id', 'projetoid', 'idprojeto', 'projeto', 'codigoprojeto', 'codigo_projeto', 'projectcode'],
    tipo: ['tipo', 'tipodespesa', 'tipo_despesa'],
    descricao: ['descricao', 'descricao', 'descricaodadespesa', 'descricao_despesa'],
    valor: ['valor', 'valorr$', 'valorr', 'valor_despesa'],
    mes: ['mes', 'mesreferencia', 'mes_referencia'],
    ano: ['ano', 'anoreferencia', 'ano_referencia'],
    naturezaCusto: ['naturezacusto', 'natureza_custo', 'fixoouvariavel', 'fixo_variavel'],
    replicarAteFimContrato: ['replicaratefimcontrato', 'replicar_ate_fim_contrato', 'replicarateofim', 'replicar'],
  };
  private static readonly TIPO_ALIASES: Record<string, TipoDespesa> = {
    comercial: TipoDespesa.COMERCIAIS,
    'endomarketing': TipoDespesa.ENDOMARKETING,
    'endo-marketing': TipoDespesa.ENDOMARKETING,
    'endo marketing': TipoDespesa.ENDOMARKETING,
  };

  private static normalizeText(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private static normalizeHeader(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    return this.normalizeText(String(value)).replace(/[^a-z0-9]/g, '');
  }

  private static isEmptyCell(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }
    return String(value).trim() === '';
  }

  private static parseNumericValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }

    const raw = String(value ?? '').trim();
    if (!raw) {
      return NaN;
    }

    const sanitized = raw.replace(/\s/g, '').replace(/[^0-9,.-]/g, '');
    const hasComma = sanitized.includes(',');
    const hasDot = sanitized.includes('.');

    let normalized = sanitized;

    if (hasComma && hasDot) {
      // Se a última vírgula vem depois do último ponto, assume formato pt-BR (1.234,56)
      if (sanitized.lastIndexOf(',') > sanitized.lastIndexOf('.')) {
        normalized = sanitized.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = sanitized.replace(/,/g, '');
      }
    } else if (hasComma) {
      normalized = sanitized.replace(',', '.');
    }

    return Number.parseFloat(normalized);
  }

  private static resolveColumnIndexes(headers: any[]): Record<string, number> {
    const normalizedHeaders = headers.map((header) => this.normalizeHeader(header));

    const findColumnIndex = (canonical: string): number => {
      const aliases = this.HEADER_ALIASES[canonical] ?? [canonical];
      return normalizedHeaders.findIndex((header) => aliases.includes(header));
    };

    return {
      projectId: findColumnIndex('projectId'),
      tipo: findColumnIndex('tipo'),
      descricao: findColumnIndex('descricao'),
      valor: findColumnIndex('valor'),
      mes: findColumnIndex('mes'),
      ano: findColumnIndex('ano'),
      naturezaCusto: findColumnIndex('naturezaCusto'),
      replicarAteFimContrato: findColumnIndex('replicarAteFimContrato'),
    };
  }

  private static parseTipoDespesa(rawTipo: string): TipoDespesa | undefined {
    const normalized = this.normalizeText(rawTipo);
    const compact = normalized.replace(/[\s_-]+/g, '');

    if (this.VALID_TIPOS.includes(normalized as TipoDespesa)) {
      return normalized as TipoDespesa;
    }

    if (this.VALID_TIPOS.includes(compact as TipoDespesa)) {
      return compact as TipoDespesa;
    }

    return this.TIPO_ALIASES[normalized] ?? this.TIPO_ALIASES[compact];
  }

  private static parseNaturezaCusto(rawNatureza: any): NaturezaCusto {
    const normalized = this.normalizeText(String(rawNatureza ?? ''));
    if (!normalized) {
      return NaturezaCusto.VARIAVEL;
    }

    if (['fixo', 'fixed'].includes(normalized)) {
      return NaturezaCusto.FIXO;
    }

    if (['variavel', 'variável', 'variable'].includes(normalized)) {
      return NaturezaCusto.VARIAVEL;
    }

    throw new Error('Natureza de custo inválida. Use FIXO ou VARIAVEL.');
  }

  private static parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = this.normalizeText(String(value ?? ''));
    if (!normalized) {
      return false;
    }

    return ['true', '1', 'sim', 's', 'yes', 'y'].includes(normalized);
  }

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
    const headers: any[] = data[0] as any[];
    const colIndexes = this.resolveColumnIndexes(headers);

    // Validar colunas obrigatórias
    const missingColumns = this.REQUIRED_COLUMNS.filter((col) => colIndexes[col] === -1);
    if (missingColumns.length > 0) {
      throw new BadRequestException({
        codigo: 'E005',
        mensagem: `Colunas obrigatórias faltando: ${missingColumns.join(', ')}`,
      });
    }

    // Validar limite de linhas
    const dataRows = data
      .slice(1)
      .filter((row) => row && row.some((cell) => !this.isEmptyCell(cell)));
    if (dataRows.length > this.MAX_ROWS) {
      throw new BadRequestException({
        codigo: 'E003',
        mensagem: `Arquivo excede o limite de ${this.MAX_ROWS} linhas. Total encontrado: ${dataRows.length}`,
      });
    }

    // Processar cada linha
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const linhaNumero = i + 2; // +2 porque: +1 para 1-indexed, +1 para pular cabeçalho

      // Pular linhas completamente vazias
      if (!row || row.every((cell) => this.isEmptyCell(cell))) {
        continue;
      }

      const item: Partial<BulkDespesaItemDto> = {};
      const rowErrors: typeof result.errors = [];

      // projectId
      const projectRef = String(row[colIndexes.projectId] ?? '').trim();
      if (!projectRef) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'projectId',
          valor: row[colIndexes.projectId],
          motivo: 'projectId é obrigatório (ID ou código do projeto)',
          codigo: 'E004',
        });
      } else {
        item.projectId = projectRef;
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
      } else {
        const tipoNormalizado = this.parseTipoDespesa(tipo);
        if (!tipoNormalizado) {
          rowErrors.push({
            linha: linhaNumero,
            coluna: 'tipo',
            valor: tipo,
            motivo: `Tipo de despesa inválido. Use: ${this.VALID_TIPOS.join(', ')}`,
            codigo: 'E005',
          });
        } else {
          item.tipo = tipoNormalizado;
        }
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
      const valorNumerico = this.parseNumericValue(valor);
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

      const naturezaRaw = colIndexes.naturezaCusto >= 0 ? row[colIndexes.naturezaCusto] : undefined;
      try {
        item.naturezaCusto = this.parseNaturezaCusto(naturezaRaw);
      } catch (error: any) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'naturezaCusto',
          valor: naturezaRaw,
          motivo: error?.message || 'Natureza de custo inválida. Use FIXO ou VARIAVEL.',
          codigo: 'E011',
        });
      }

      const replicarRaw =
        colIndexes.replicarAteFimContrato >= 0 ? row[colIndexes.replicarAteFimContrato] : undefined;
      item.replicarAteFimContrato = this.parseBoolean(replicarRaw);

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
      [
        'projectId',
        'tipo',
        'naturezaCusto',
        'replicarAteFimContrato',
        'descricao',
        'valor',
        'mes',
        'ano',
      ],
      [
        '550e8400-e29b-41d4-a716-446655440000',
        'facilities',
        'FIXO',
        true,
        'Limpeza e manutenção predial - Março',
        5000.0,
        3,
        2026,
      ],
      [
        '550e8400-e29b-41d4-a716-446655440000',
        'fornecedor',
        'VARIAVEL',
        false,
        'Licenças de software',
        12500.75,
        3,
        2026,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Definir largura das colunas
    ws['!cols'] = [
      { wch: 40 }, // projectId
      { wch: 15 }, // tipo
      { wch: 14 }, // naturezaCusto
      { wch: 22 }, // replicarAteFimContrato
      { wch: 50 }, // descricao
      { wch: 12 }, // valor
      { wch: 6 }, // mes
      { wch: 6 }, // ano
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Despesas');

    // Gerar buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}
