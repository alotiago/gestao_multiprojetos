import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardExecutivo(ano?: string, projectId?: string): Promise<{
        ano: number;
        kpis: {
            projetosTotal: number;
            projetosAtivos: number;
            colaboradoresAtivos: number;
            fteTotal: number;
            carteiraAcumulada: number;
        };
        financeiro: {
            receitaPrevista: number;
            receitaRealizada: number;
            totalCustoPessoal: number;
            totalDespesas: number;
            totalImpostos: number;
            totalCustos: number;
            margemPrevista: number;
            margemRealizada: number;
        };
        projetos: {
            distribuicaoStatus: Record<string, number>;
        };
    }>;
    getDashboardFinanceiro(ano?: string, mes?: string, projectId?: string): Promise<{
        ano: number;
        mes: number | null;
        projetos: any[];
        totais: {
            receitaPrevista: number;
            receitaRealizada: number;
            totalCustos: number;
            margemGlobal: number;
        };
    }>;
    exportDashboardFinanceiroCsv(ano?: string, mes?: string, projectId?: string): Promise<string>;
    getDashboardRecursos(ano: number, mes?: number): Promise<{
        ano: number;
        mes: number | null;
        kpis: {
            totalColaboradoresAtivos: number;
            fteTotal: number;
            horasRealizadas: number;
            horasPrevistas: number;
            utilizacaoMedia: number;
        };
        ftePorEstado: {
            estado: string;
            fte: number;
        }[];
        ftePorCargo: {
            cargo: string;
            fte: number;
        }[];
    }>;
    getDashboardProjetos(ano: number): Promise<{
        id: string;
        codigo: string;
        nome: string;
        cliente: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        ano: number;
        receitaPrevista: number;
        receitaRealizada: number;
        totalCustos: number;
        margem: number;
    }[]>;
    getVisaoAnoAno(anoInicio?: number, anoFim?: number): Promise<{
        ano: number;
        receitaPrevista: number;
        receitaRealizada: number;
        totalCustos: number;
        margem: number;
    }[]>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map