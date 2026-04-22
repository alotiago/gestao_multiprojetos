import * as XLSX from 'xlsx';
import { ExcelReceitasParser } from './excel-receitas-parser';

describe('ExcelReceitasParser', () => {
  describe('parseExcel - validações de arquivo', () => {
    it('deve rejeitar extensão inválida', () => {
      const buffer = Buffer.from('fake data');

      expect(() => {
        ExcelReceitasParser.parseExcel(buffer, 'test.txt');
      }).toThrow();
    });

    it('deve rejeitar arquivo sem aba Receitas', () => {
      const ws = XLSX.utils.aoa_to_sheet([['projectId', 'mes', 'ano']]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'WrongSheet');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      expect(() => {
        ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');
      }).toThrow();
    });
  });

  describe('parseExcel - modo manual', () => {
    it('deve processar linha manual válida', () => {
      const rows = [
        [
          'projectId',
          'modo',
          'tipoReceita',
          'descricao',
          'valorPrevisto',
          'valorRealizado',
          'justificativa',
          'mes',
          'ano',
          'mesesAdicionais',
        ],
        [
          'PROJ-001',
          'manual',
          'Serviços',
          'Receita mensal',
          '12.345,67',
          '10.000,00',
          'Ajuste por entrega parcial',
          '3',
          '2026',
          '2',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        projectId: 'PROJ-001',
        modo: 'manual',
        tipoReceita: 'Serviços',
        valorPrevisto: 12345.67,
        valorRealizado: 10000,
        mes: 3,
        ano: 2026,
        mesesAdicionais: 2,
      });
    });

    it('deve rejeitar manual sem tipoReceita e sem valorPrevisto', () => {
      const rows = [
        ['projectId', 'modo', 'tipoReceita', 'valorPrevisto', 'mes', 'ano'],
        ['PROJ-001', 'manual', '', '', '3', '2026'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors.some((e) => e.coluna === 'tipoReceita')).toBe(true);
      expect(result.errors.some((e) => e.coluna === 'valorPrevisto')).toBe(true);
    });

    it('deve exigir justificativa quando realizado difere do planejado e realizado > 0', () => {
      const rows = [
        ['projectId', 'modo', 'tipoReceita', 'valorPrevisto', 'valorRealizado', 'justificativa', 'mes', 'ano'],
        ['PROJ-001', 'manual', 'Serviços', '1000', '900', '', '3', '2026'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors.some((e) => e.coluna === 'justificativa')).toBe(true);
    });
  });

  describe('parseExcel - modo contrato', () => {
    it('deve processar linha de contrato válida', () => {
      const rows = [
        [
          'projectId',
          'modo',
          'linhaContratualId',
          'quantidade',
          'quantidadeRealizada',
          'valorRealizado',
          'mes',
          'ano',
        ],
        [
          'PROJ-002',
          'contrato',
          '6f8a3c36-01aa-4fd4-a38f-7fc252b65f56',
          '10',
          '8',
          '5000',
          '4',
          '2026',
        ],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        projectId: 'PROJ-002',
        modo: 'contrato',
        linhaContratualId: '6f8a3c36-01aa-4fd4-a38f-7fc252b65f56',
        quantidade: 10,
        quantidadeRealizada: 8,
        mes: 4,
        ano: 2026,
      });
      expect(result.items[0].valorPrevisto).toBeUndefined();
    });

    it('deve inferir modo contrato quando houver linhaContratualId', () => {
      const rows = [
        ['projectId', 'linhaContratualId', 'quantidade', 'mes', 'ano'],
        ['PROJ-002', 'linha-123', '4', '5', '2026'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].modo).toBe('contrato');
    });

    it('deve aceitar quantidade zero no modo contrato', () => {
      const rows = [
        ['projectId', 'modo', 'linhaContratualId', 'quantidade', 'mes', 'ano'],
        ['PROJ-002', 'contrato', 'linha-123', '0', '5', '2026'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');

      expect(result.errors).toHaveLength(0);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantidade).toBe(0);
    });

    it('deve rejeitar contrato sem linhaContratualId ou quantidade', () => {
      const rows = [
        ['projectId', 'modo', 'linhaContratualId', 'quantidade', 'mes', 'ano'],
        ['PROJ-002', 'contrato', '', '', '4', '2026'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = ExcelReceitasParser.parseExcel(buffer, 'test.xlsx');

      expect(result.items).toHaveLength(0);
      expect(result.errors.some((e) => e.coluna === 'linhaContratualId')).toBe(true);
      expect(result.errors.some((e) => e.coluna === 'quantidade')).toBe(true);
    });
  });

  describe('generateTemplate', () => {
    it('deve gerar arquivo com aba Receitas', () => {
      const buffer = ExcelReceitasParser.generateTemplate();

      const wb = XLSX.read(buffer, { type: 'buffer' });
      expect(wb.SheetNames).toContain('Receitas');

      const ws = wb.Sheets['Receitas'];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      expect(data.length).toBeGreaterThan(2);
      expect(data[0]).toContain('modo');
      expect(data[0]).toContain('justificativa');
      expect(data[0]).toContain('linhaContratualId');
      expect(data[0]).toContain('quantidade');
    });

    it('deve gerar template contextualizado com referências do projeto', () => {
      const buffer = ExcelReceitasParser.generateTemplate({
        projectId: 'proj-123',
        projectCodigo: 'PRJ-123',
        projectNome: 'Projeto Teste',
        ano: 2026,
        linhas: [
          {
            objetoContratualId: 'obj-1',
            objetoNome: 'Objeto A',
            linhaContratualId: 'lin-1',
            linhaDescricao: 'Linha A1',
            unidade: 'hora',
            valorUnitario: 150,
          },
        ],
      });

      const wb = XLSX.read(buffer, { type: 'buffer' });
      expect(wb.SheetNames).toContain('Receitas');
      expect(wb.SheetNames).toContain('Referencias');

      const wsReceitas = wb.Sheets['Receitas'];
      const dataReceitas = XLSX.utils.sheet_to_json(wsReceitas, { header: 1 }) as any[][];
      expect(dataReceitas[1][0]).toBe('PRJ-123');
      expect(dataReceitas[2][7]).toBe('obj-1');
      expect(dataReceitas[2][8]).toBe('lin-1');

      const wsRef = wb.Sheets['Referencias'];
      const dataRef = XLSX.utils.sheet_to_json(wsRef, { header: 1 }) as any[][];
      expect(dataRef).toHaveLength(2);
      expect(dataRef[1][0]).toBe('proj-123');
      expect(dataRef[1][2]).toBe('obj-1');
      expect(dataRef[1][4]).toBe('lin-1');
    });
  });
});
