import { ExcelParser } from './excel-parser';
import * as XLSX from 'xlsx';

describe('ExcelParser', () => {
  describe('parseExcel - Validações de Arquivo', () => {
    it('deve rejeitar arquivo maior que 5MB (E001)', () => {
      // Arquivo de 6MB (simulado com Buffer grande)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      
      expect(() => {
        ExcelParser.parseExcel(largeBuffer, 'test.xlsx');
      }).toThrow();
    });

    it('deve rejeitar extensão inválida (E002)', () => {
      const buffer = Buffer.from('fake data');
      
      expect(() => {
        ExcelParser.parseExcel(buffer, 'test.txt');
      }).toThrow();
    });

    it('deve rejeitar arquivo Excel sem aba "Despesas" (E002)', () => {
      // Cria Excel com aba errada
      const ws = XLSX.utils.aoa_to_sheet([['Header1', 'Header2']]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'WrongSheet');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      expect(() => {
        ExcelParser.parseExcel(buffer, 'test.xlsx');
      }).toThrow();
    });

    it('deve rejeitar arquivo com colunas faltando (E005)', () => {
      // Cria Excel com apenas 3 colunas (faltam 3)
      const ws = XLSX.utils.aoa_to_sheet([
        ['projectId', 'tipo', 'descricao'], // Faltam: valor, mes, ano
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      expect(() => {
        ExcelParser.parseExcel(buffer, 'test.xlsx');
      }).toThrow();
    });

    it('deve rejeitar arquivo com mais de 1000 linhas (E003)', () => {
      // Cria Excel com 1001 linhas de dados (+ 1 header = 1002)
      const rows = [['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano']];
      for (let i = 0; i < 1001; i++) {
        rows.push([
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Teste',
          '100.50',
          '1',
          '2024',
        ]);
      }
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      expect(() => {
        ExcelParser.parseExcel(buffer, 'test.xlsx');
      }).toThrow();
    });
  });

  describe('parseExcel - Validações de Dados', () => {
    it('deve aceitar cabeçalhos com variações de nome e acentuação', () => {
      const rows = [
        ['Projeto', 'Tipo Despesa', 'Descrição', 'Valor (R$)', 'Mês', 'Ano'],
        ['PRJ-001', 'Comerciais', 'Despesa com cabeçalho alternativo', '1.234,56', '3', '2024'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].projectId).toBe('PRJ-001');
      expect(result.items[0].tipo).toBe('comerciais');
      expect(result.items[0].valor).toBe(1234.56);
    });

    it('deve processar arquivo válido com sucesso', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Despesa teste 1',
          '1500.75',
          '3',
          '2024',
        ],
        [
          '123e4567-e89b-12d3-a456-426614174001',
          'fornecedor',
          'Despesa teste 2',
          '2500.00',
          '6',
          '2024',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toMatchObject({
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        tipo: 'facilities',
        descricao: 'Despesa teste 1',
        valor: 1500.75,
        mes: 3,
        ano: 2024,
        naturezaCusto: 'VARIAVEL',
        replicarAteFimContrato: false,
      });
    });

    it('deve processar projectId (validação de existência será feita na importação)', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        ['invalid-uuid', 'facilities', 'Teste', '100', '1', '2024'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      // Parser aceita qualquer string não vazia em projectId
      // A validação de UUID e existência é feita no serviço de importação
      expect(result.items).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.items[0].projectId).toBe('invalid-uuid');
    });

    it('deve rejeitar tipo de despesa inválido (E005)', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'tipo_invalido',
          'Teste',
          '100',
          '1',
          '2024',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].codigo).toBe('E005');
      expect(result.errors[0].motivo).toContain('Tipo de despesa inválido');
    });

    it('deve rejeitar valor negativo ou zero (E006)', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Teste 1',
          '-100',
          '1',
          '2024',
        ],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Teste 2',
          '0',
          '1',
          '2024',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].codigo).toBe('E006');
      expect(result.errors[1].codigo).toBe('E006');
    });

    it('deve interpretar valor monetário no padrão brasileiro', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        ['123e4567-e89b-12d3-a456-426614174000', 'software', 'Licença anual', '12.345,67', '1', '2024'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].valor).toBe(12345.67);
    });

    it('deve rejeitar mês fora do intervalo 1-12 (E007)', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Teste 1',
          '100',
          '0',
          '2024',
        ],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Teste 2',
          '100',
          '13',
          '2024',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].codigo).toBe('E007');
      expect(result.errors[1].codigo).toBe('E007');
    });

    it('deve rejeitar ano fora do intervalo 2020-2100 (E008)', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Teste 1',
          '100',
          '1',
          '2019',
        ],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Teste 2',
          '100',
          '1',
          '2101',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].codigo).toBe('E008');
      expect(result.errors[1].codigo).toBe('E008');
    });

    it('deve rejeitar descrição vazia (E009)', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        ['123e4567-e89b-12d3-a456-426614174000', 'facilities', '', '100', '1', '2024'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].codigo).toBe('E009');
    });

    it('deve processar parcialmente arquivo com linhas válidas e inválidas', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        // Linha 2 - válida
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Despesa válida',
          '1500',
          '3',
          '2024',
        ],
        // Linha 3 - inválida (mês errado)
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Despesa invalida',
          '500',
          '15',
          '2024',
        ],
        // Linha 4 - válida
        [
          '123e4567-e89b-12d3-a456-426614174001',
          'fornecedor',
          'Outra válida',
          '2500',
          '6',
          '2024',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].linha).toBe(3);
      expect(result.errors[0].codigo).toBe('E007');
    });

    it('deve ignorar linhas completamente vazias', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        [
          '123e4567-e89b-12d3-a456-426614174000',
          'facilities',
          'Despesa válida',
          '1500',
          '3',
          '2024',
        ],
        ['', '', '', '', '', ''], // Linha vazia
        [
          '123e4567-e89b-12d3-a456-426614174001',
          'fornecedor',
          'Outra válida',
          '2500',
          '6',
          '2024',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('generateTemplate', () => {
    it('deve gerar buffer de Excel válido', () => {
      const buffer = ExcelParser.generateTemplate();

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verificar se é um arquivo Excel válido
      const wb = XLSX.read(buffer, { type: 'buffer' });
      expect(wb.SheetNames).toContain('Despesas');
    });

    it('deve conter as colunas obrigatórias e auxiliares', () => {
      const buffer = ExcelParser.generateTemplate();
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const ws = wb.Sheets['Despesas'];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      const headers = data[0];
      expect(headers).toContain('projectId');
      expect(headers).toContain('tipo');
      expect(headers).toContain('naturezaCusto');
      expect(headers).toContain('replicarAteFimContrato');
      expect(headers).toContain('descricao');
      expect(headers).toContain('valor');
      expect(headers).toContain('mes');
      expect(headers).toContain('ano');
    });

    it('deve conter linhas de exemplo', () => {
      const buffer = ExcelParser.generateTemplate();
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const ws = wb.Sheets['Despesas'];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Header + pelo menos 1 linha de exemplo
      expect(data.length).toBeGreaterThan(1);
    });
  });

  describe('Validações de Tipo', () => {
    it('deve aceitar todos os tipos válidos de despesa', () => {
      const tiposValidos = [
        'comerciais',
        'operacao',
        'taxas',
        'administrativas',
        'software',
        'tributarias',
        'financeiras',
        'facilities',
        'fornecedor',
        'aluguel',
        'endomarketing',
        'amortizacao',
        'rateio',
        'provisao',
        'outros',
      ];

      const rows = [['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano']];
      
      tiposValidos.forEach((tipo) => {
        rows.push([
          '123e4567-e89b-12d3-a456-426614174000',
          tipo,
          `Despesa ${tipo}`,
          '100',
          '1',
          '2024',
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(tiposValidos.length);
      expect(result.errors).toHaveLength(0);
    });

    it('deve aceitar tipos com acentos e normalizar para formato canônico', () => {
      const rows = [
        ['projectId', 'tipo', 'descricao', 'valor', 'mes', 'ano'],
        ['123e4567-e89b-12d3-a456-426614174000', 'Operação', 'Despesa Operação', '100', '1', '2024'],
        ['123e4567-e89b-12d3-a456-426614174000', 'Tributárias', 'Despesa Tributária', '100', '1', '2024'],
        ['123e4567-e89b-12d3-a456-426614174000', 'Amortização', 'Despesa Amortização', '100', '1', '2024'],
        ['123e4567-e89b-12d3-a456-426614174000', 'Provisão', 'Despesa Provisão', '100', '1', '2024'],
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Despesas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(4);
      expect(result.items[0].tipo).toBe('operacao');
      expect(result.items[1].tipo).toBe('tributarias');
      expect(result.items[2].tipo).toBe('amortizacao');
      expect(result.items[3].tipo).toBe('provisao');
    });
  });
});
