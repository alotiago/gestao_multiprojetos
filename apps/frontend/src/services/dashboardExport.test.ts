import {
  buildDashboardFinanceiroCsvFilename,
  buildDashboardFinanceiroCsvUrl,
} from './dashboardExport';

describe('dashboardExport utils', () => {
  describe('buildDashboardFinanceiroCsvUrl', () => {
    it('deve montar URL com ano', () => {
      const result = buildDashboardFinanceiroCsvUrl(2026);
      expect(result).toBe('/dashboard/financeiro/export/csv?ano=2026');
    });

    it('deve montar URL com ano e mes', () => {
      const result = buildDashboardFinanceiroCsvUrl(2026, 3);
      expect(result).toBe('/dashboard/financeiro/export/csv?ano=2026&mes=3');
    });
  });

  describe('buildDashboardFinanceiroCsvFilename', () => {
    it('deve gerar nome com ano', () => {
      const result = buildDashboardFinanceiroCsvFilename(2026);
      expect(result).toBe('dashboard-financeiro-ano-2026.csv');
    });

    it('deve gerar nome com ano e mes com zero a esquerda', () => {
      const result = buildDashboardFinanceiroCsvFilename(2026, 3);
      expect(result).toBe('dashboard-financeiro-ano-2026-mes-03.csv');
    });
  });
});
