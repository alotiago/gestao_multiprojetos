import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';

export interface ReceitaExcelItem {
  linha: number;
  projectId: string;
  modo: 'manual' | 'contrato';
  tipoReceita?: string;
  descricao?: string;
  valorPrevisto?: number;
  valorRealizado: number;
  justificativa?: string;
  mes: number;
  ano: number;
  mesesAdicionais: number;
  objetoContratualId?: string;
  linhaContratualId?: string;
  quantidade?: number;
  quantidadeRealizada?: number;
}

export interface ExcelReceitasParseResult {
  items: ReceitaExcelItem[];
  errors: Array<{ linha: number; coluna?: string; valor?: any; motivo: string; codigo: string }>;
  warnings: string[];
}

export interface ReceitaTemplateLinhaContexto {
  objetoContratualId: string;
  objetoNome: string;
  linhaContratualId: string;
  linhaDescricao: string;
  unidade: string;
  valorUnitario: number;
}

export interface ReceitaTemplateContext {
  projectId: string;
  projectCodigo?: string;
  projectNome?: string;
  ano?: number;
  linhas?: ReceitaTemplateLinhaContexto[];
}

export class ExcelReceitasParser {
  private static readonly MAX_ROWS = 1000;
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly REQUIRED_COLUMNS = [
    'projectId',
    'mes',
    'ano',
  ];
  private static readonly HEADER_ALIASES: Record<string, string[]> = {
    projectId: [
      'projectid',
      'project_id',
      'projetoid',
      'idprojeto',
      'projeto',
      'codigoprojeto',
      'codigo_projeto',
      'projectcode',
    ],
    tipoReceita: ['tiporeceita', 'tipo_receita', 'tipo', 'categoriareceita'],
    descricao: ['descricao', 'descricaoreceita', 'descricao_receita'],
    valorPrevisto: ['valorprevisto', 'valor_previsto', 'previsto', 'valorplanejado'],
    valorRealizado: ['valorrealizado', 'valor_realizado', 'realizado'],
    justificativa: ['justificativa', 'justificacao', 'motivo', 'observacao'],
    modo: ['modo', 'tipolinha', 'tipo_linha', 'tipoimportacao', 'tipo_importacao'],
    objetoContratualId: ['objetocontratualid', 'objeto_contratual_id', 'objetoid'],
    linhaContratualId: ['linhacontratualid', 'linha_contratual_id', 'linhaid'],
    quantidade: ['quantidade', 'qtd', 'qtde'],
    quantidadeRealizada: ['quantidaderealizada', 'quantidade_realizada', 'qtdrealizada'],
    mes: ['mes', 'mesreferencia', 'mes_referencia'],
    ano: ['ano', 'anoreferencia', 'ano_referencia'],
    mesesAdicionais: ['mesesadicionais', 'meses_adicionais', 'replicar', 'replicarproximosmeses'],
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
      tipoReceita: findColumnIndex('tipoReceita'),
      descricao: findColumnIndex('descricao'),
      valorPrevisto: findColumnIndex('valorPrevisto'),
      valorRealizado: findColumnIndex('valorRealizado'),
      justificativa: findColumnIndex('justificativa'),
      modo: findColumnIndex('modo'),
      objetoContratualId: findColumnIndex('objetoContratualId'),
      linhaContratualId: findColumnIndex('linhaContratualId'),
      quantidade: findColumnIndex('quantidade'),
      quantidadeRealizada: findColumnIndex('quantidadeRealizada'),
      mes: findColumnIndex('mes'),
      ano: findColumnIndex('ano'),
      mesesAdicionais: findColumnIndex('mesesAdicionais'),
    };
  }

  private static parseModo(
    modoRaw: any,
    linhaContratualId: string,
  ): 'manual' | 'contrato' | undefined {
    if (!this.isEmptyCell(modoRaw)) {
      const normalized = this.normalizeText(String(modoRaw));
      if (['manual'].includes(normalized)) return 'manual';
      if (['contrato', 'via contrato', 'viacontrato'].includes(normalized)) return 'contrato';
      return undefined;
    }

    if (linhaContratualId) {
      return 'contrato';
    }

    return 'manual';
  }

  private static normalizeJustificativa(value: any): string | undefined {
    if (this.isEmptyCell(value)) {
      return undefined;
    }

    const texto = String(value).trim();
    return texto ? texto : undefined;
  }

  static parseExcel(buffer: Buffer, filename: string): ExcelReceitasParseResult {
    const result: ExcelReceitasParseResult = {
      items: [],
      errors: [],
      warnings: [],
    };

    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new BadRequestException({
        codigo: 'E001',
        mensagem: 'Arquivo excede o tamanho máximo de 5MB',
      });
    }

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
    } catch {
      throw new BadRequestException({
        codigo: 'E003',
        mensagem: 'Não foi possível ler o arquivo Excel. Verifique se o arquivo não está corrompido.',
      });
    }

    if (!workbook.SheetNames.includes('Receitas')) {
      throw new BadRequestException({
        codigo: 'E002',
        mensagem: 'Planilha "Receitas" não encontrada. O template deve ter uma aba chamada "Receitas".',
      });
    }

    const worksheet = workbook.Sheets['Receitas'];
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 2) {
      throw new BadRequestException({
        codigo: 'E004',
        mensagem: 'Arquivo vazio. Adicione pelo menos uma linha de dados.',
      });
    }

    const headers: any[] = data[0] as any[];
    const colIndexes = this.resolveColumnIndexes(headers);

    const missingColumns = this.REQUIRED_COLUMNS.filter((col) => colIndexes[col] === -1);
    if (missingColumns.length > 0) {
      throw new BadRequestException({
        codigo: 'E005',
        mensagem: `Colunas obrigatórias faltando: ${missingColumns.join(', ')}`,
      });
    }

    const dataRows = data
      .slice(1)
      .filter((row) => row && row.some((cell) => !this.isEmptyCell(cell)));
    if (dataRows.length > this.MAX_ROWS) {
      throw new BadRequestException({
        codigo: 'E003',
        mensagem: `Arquivo excede o limite de ${this.MAX_ROWS} linhas. Total encontrado: ${dataRows.length}`,
      });
    }

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const linhaNumero = i + 2;

      if (!row || row.every((cell) => this.isEmptyCell(cell))) {
        continue;
      }

      const rowErrors: typeof result.errors = [];

      const projectId = String(row[colIndexes.projectId] ?? '').trim();
      if (!projectId) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'projectId',
          valor: row[colIndexes.projectId],
          motivo: 'projectId é obrigatório (ID ou código do projeto)',
          codigo: 'E004',
        });
      }

      const linhaContratualId =
        colIndexes.linhaContratualId >= 0
          ? String(row[colIndexes.linhaContratualId] ?? '').trim()
          : '';
      const modoRaw = colIndexes.modo >= 0 ? row[colIndexes.modo] : undefined;
      const modo = this.parseModo(modoRaw, linhaContratualId);
      if (!modo) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'modo',
          valor: modoRaw,
          motivo: 'Modo inválido. Use manual ou contrato',
          codigo: 'E011',
        });
      }

      const tipoReceita = String(row[colIndexes.tipoReceita] ?? '').trim();

      const descricaoRaw = row[colIndexes.descricao];
      const descricao = this.isEmptyCell(descricaoRaw) ? '' : String(descricaoRaw).trim();
      if (descricao.length > 255) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'descricao',
          valor: descricaoRaw,
          motivo: 'Descrição não pode ter mais de 255 caracteres',
          codigo: 'E009',
        });
      }

      const valorPrevistoRaw = row[colIndexes.valorPrevisto];
      const valorPrevisto = this.isEmptyCell(valorPrevistoRaw)
        ? NaN
        : this.parseNumericValue(valorPrevistoRaw);

      const valorRealizadoRaw = colIndexes.valorRealizado >= 0 ? row[colIndexes.valorRealizado] : undefined;
      const valorRealizado = this.isEmptyCell(valorRealizadoRaw)
        ? 0
        : this.parseNumericValue(valorRealizadoRaw);
      if (Number.isNaN(valorRealizado) || valorRealizado < 0) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'valorRealizado',
          valor: valorRealizadoRaw,
          motivo: 'valorRealizado deve ser um número maior ou igual a zero',
          codigo: 'E006',
        });
      }

      const justificativaRaw = colIndexes.justificativa >= 0 ? row[colIndexes.justificativa] : undefined;
      const justificativa = this.normalizeJustificativa(justificativaRaw);
      if (justificativa && justificativa.length > 1000) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'justificativa',
          valor: justificativaRaw,
          motivo: 'Justificativa não pode ter mais de 1000 caracteres',
          codigo: 'E015',
        });
      }

      const objetoContratualId =
        colIndexes.objetoContratualId >= 0
          ? String(row[colIndexes.objetoContratualId] ?? '').trim()
          : '';

      const quantidadeRaw = colIndexes.quantidade >= 0 ? row[colIndexes.quantidade] : undefined;
      const quantidade = this.isEmptyCell(quantidadeRaw)
        ? NaN
        : this.parseNumericValue(quantidadeRaw);

      const quantidadeRealizadaRaw =
        colIndexes.quantidadeRealizada >= 0 ? row[colIndexes.quantidadeRealizada] : undefined;
      const quantidadeRealizada = this.isEmptyCell(quantidadeRealizadaRaw)
        ? 0
        : this.parseNumericValue(quantidadeRealizadaRaw);
      if (Number.isNaN(quantidadeRealizada) || quantidadeRealizada < 0) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'quantidadeRealizada',
          valor: quantidadeRealizadaRaw,
          motivo: 'quantidadeRealizada deve ser um número maior ou igual a zero',
          codigo: 'E012',
        });
      }

      const mesRaw = row[colIndexes.mes];
      const mes = typeof mesRaw === 'number' ? mesRaw : parseInt(String(mesRaw || ''), 10);
      if (Number.isNaN(mes) || mes < 1 || mes > 12) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'mes',
          valor: mesRaw,
          motivo: 'Mês deve estar entre 1 e 12',
          codigo: 'E007',
        });
      }

      const anoRaw = row[colIndexes.ano];
      const ano = typeof anoRaw === 'number' ? anoRaw : parseInt(String(anoRaw || ''), 10);
      if (Number.isNaN(ano) || ano < 2020 || ano > 2100) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'ano',
          valor: anoRaw,
          motivo: 'Ano deve estar entre 2020 e 2100',
          codigo: 'E008',
        });
      }

      const mesesAdicionaisRaw =
        colIndexes.mesesAdicionais >= 0 ? row[colIndexes.mesesAdicionais] : undefined;
      const mesesAdicionais = this.isEmptyCell(mesesAdicionaisRaw)
        ? 0
        : parseInt(String(mesesAdicionaisRaw), 10);
      if (Number.isNaN(mesesAdicionais) || mesesAdicionais < 0 || mesesAdicionais > 36) {
        rowErrors.push({
          linha: linhaNumero,
          coluna: 'mesesAdicionais',
          valor: mesesAdicionaisRaw,
          motivo: 'mesesAdicionais deve estar entre 0 e 36',
          codigo: 'E010',
        });
      }

      if (modo === 'manual') {
        if (!tipoReceita) {
          rowErrors.push({
            linha: linhaNumero,
            coluna: 'tipoReceita',
            valor: row[colIndexes.tipoReceita],
            motivo: 'tipoReceita é obrigatório para modo manual',
            codigo: 'E005',
          });
        }

        if (Number.isNaN(valorPrevisto) || valorPrevisto < 0) {
          rowErrors.push({
            linha: linhaNumero,
            coluna: 'valorPrevisto',
            valor: valorPrevistoRaw,
            motivo: 'valorPrevisto deve ser um número maior ou igual a zero no modo manual',
            codigo: 'E006',
          });
        }

        const precisaJustificar =
          !Number.isNaN(valorPrevisto) && valorRealizado > 0 && Math.abs(valorRealizado - valorPrevisto) >= 0.01;
        if (precisaJustificar && !justificativa) {
          rowErrors.push({
            linha: linhaNumero,
            coluna: 'justificativa',
            valor: justificativaRaw,
            motivo:
              'Justificativa é obrigatória quando valorRealizado for diferente de valorPrevisto (exceto quando valorRealizado for 0 ou vazio)',
            codigo: 'E016',
          });
        }
      }

      if (modo === 'contrato') {
        if (!linhaContratualId) {
          rowErrors.push({
            linha: linhaNumero,
            coluna: 'linhaContratualId',
            valor: row[colIndexes.linhaContratualId],
            motivo: 'linhaContratualId é obrigatório para modo contrato',
            codigo: 'E013',
          });
        }

        if (Number.isNaN(quantidade) || quantidade < 0) {
          rowErrors.push({
            linha: linhaNumero,
            coluna: 'quantidade',
            valor: quantidadeRaw,
            motivo: 'quantidade deve ser um número maior ou igual a zero no modo contrato',
            codigo: 'E014',
          });
        }
      }

      if (rowErrors.length > 0) {
        result.errors.push(...rowErrors);
        continue;
      }

      result.items.push({
        linha: linhaNumero,
        projectId,
        modo: modo ?? 'manual',
        tipoReceita: tipoReceita || undefined,
        descricao,
        valorPrevisto: Number.isNaN(valorPrevisto) ? undefined : Math.round(valorPrevisto * 100) / 100,
        valorRealizado: Math.round(valorRealizado * 100) / 100,
        justificativa,
        mes,
        ano,
        mesesAdicionais,
        objetoContratualId: objetoContratualId || undefined,
        linhaContratualId: linhaContratualId || undefined,
        quantidade: Number.isNaN(quantidade) ? undefined : Math.round(quantidade * 100) / 100,
        quantidadeRealizada:
          Number.isNaN(quantidadeRealizada) ? undefined : Math.round(quantidadeRealizada * 100) / 100,
      });
    }

    if (result.errors.length > 0) {
      result.warnings.push(`${result.errors.length} linha(s) com erros foram ignoradas`);
    }

    return result;
  }

  static generateTemplate(context?: ReceitaTemplateContext): Buffer {
    const wb = XLSX.utils.book_new();
    const anoAtual = context?.ano || new Date().getFullYear();
    const projectRef = context?.projectCodigo || context?.projectId || 'PROJ-001';
    const projectLabel = context?.projectNome
      ? `${projectRef} - ${context.projectNome}`
      : projectRef;
    const linhasContrato = context?.linhas || [];

    const linhaManualExemplo = [
      projectRef,
      'manual',
      'Serviços',
      `Receita manual - ${projectLabel}`,
      45000.0,
      42000.0,
      'Realizado menor por atraso parcial na entrega',
      '',
      '',
      '',
      '',
      3,
      anoAtual,
      0,
    ];

    const linhasContratoExemplo = linhasContrato.map((linha, index) => [
      projectRef,
      'contrato',
      'Serviços',
      `Receita vinculada - ${linha.objetoNome} / ${linha.linhaDescricao}`,
      '',
      0,
      '',
      linha.objetoContratualId,
      linha.linhaContratualId,
      1,
      0,
      index + 1,
      anoAtual,
      0,
    ]);

    const data = [
      [
        'projectId',
        'modo',
        'tipoReceita',
        'descricao',
        'valorPrevisto',
        'valorRealizado',
        'justificativa',
        'objetoContratualId',
        'linhaContratualId',
        'quantidade',
        'quantidadeRealizada',
        'mes',
        'ano',
        'mesesAdicionais',
      ],
      linhaManualExemplo,
      ...(linhasContratoExemplo.length > 0
        ? linhasContratoExemplo
        : [
            [
              projectRef,
              'contrato',
              'Serviços',
              'Receita vinculada à linha contratual',
              '',
              0,
              '',
              'objetoContratualId',
              'linhaContratualId',
              1,
              0,
              4,
              anoAtual,
              0,
            ],
          ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
      { wch: 40 },
      { wch: 12 },
      { wch: 18 },
      { wch: 45 },
      { wch: 15 },
      { wch: 15 },
      { wch: 45 },
      { wch: 40 },
      { wch: 40 },
      { wch: 12 },
      { wch: 18 },
      { wch: 8 },
      { wch: 8 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Receitas');

    const referencias = [
      ['projectId', 'projeto', 'objetoContratualId', 'objetoNome', 'linhaContratualId', 'linhaDescricao', 'unidade', 'valorUnitario'],
      ...linhasContrato.map((linha) => [
        context?.projectId || projectRef,
        projectLabel,
        linha.objetoContratualId,
        linha.objetoNome,
        linha.linhaContratualId,
        linha.linhaDescricao,
        linha.unidade,
        linha.valorUnitario,
      ]),
    ];

    const wsRef = XLSX.utils.aoa_to_sheet(referencias);
    wsRef['!cols'] = [
      { wch: 40 },
      { wch: 36 },
      { wch: 40 },
      { wch: 28 },
      { wch: 40 },
      { wch: 45 },
      { wch: 14 },
      { wch: 14 },
    ];

    XLSX.utils.book_append_sheet(wb, wsRef, 'Referencias');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}