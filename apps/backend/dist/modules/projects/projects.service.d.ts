import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export interface MargemIndicadores {
    projectId: string;
    ano: number;
    mes?: number;
    receitaBruta: number;
    custoTotal: number;
    despesaTotal: number;
    impostoTotal: number;
    margeBruta: number;
    margemBrutaPercent: number;
    margemOperacional: number;
    margemOperacionalPercent: number;
    margemLiquida: number;
    margemLiquidaPercent: number;
}
export interface FcstPoint {
    mes: number;
    ano: number;
    valorPrevisto: number;
    valorFcst: number;
    variacao: number;
    variacaoPercent: number;
}
export interface CarteiraAnalise {
    totalProjetos: number;
    projetosAtivos: number;
    projetosConcluidos: number;
    receitaBrutaTotal: number;
    receitaRealizadaTotal: number;
    percentualRealizacao: number;
    porMes: {
        mes: number;
        ano: number;
        previsto: number;
        realizado: number;
    }[];
    porUnidade: {
        unitId: string;
        nome: string;
        totalPrevisto: number;
    }[];
}
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Lista projetos com paginação, filtros e ordenação
     */
    findAll(filters?: FilterProjectDto): Promise<PaginatedResult<any>>;
    /**
     * Busca projeto por ID ou código
     */
    findById(id: string): Promise<any>;
    /**
     * Cria novo projeto
     */
    create(dto: CreateProjectDto, userId: string): Promise<any>;
    /**
     * Atualiza projeto
     */
    update(id: string, dto: UpdateProjectDto): Promise<any>;
    /**
     * Soft delete de projeto
     */
    delete(id: string): Promise<{
        message: string;
        project: any;
    }>;
    findReceitas(projectId: string, ano?: number): Promise<any[]>;
    createReceita(projectId: string, dto: CreateReceitaDto): Promise<any>;
    updateReceita(projectId: string, receitaId: string, dto: UpdateReceitaDto): Promise<any>;
    /**
     * Gera projeção FCST baseada em regressão linear sobre o histórico
     */
    calcularFcst(projectId: string, anoFim?: number): Promise<FcstPoint[]>;
    calcularMargens(projectId: string, ano: number, mes?: number): Promise<MargemIndicadores>;
    analisarCarteira(ano?: number, unitId?: string): Promise<CarteiraAnalise>;
    consolidar(projectId: string, ano: number): Promise<any[]>;
    /**
     * Importa múltiplos projetos em lote com validação individual
     */
    importarEmLote(projetos: any[], userId: string, descricaoOperacao?: string): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: any[];
    }>;
    private _assertProjectExists;
    private _agruparReceitasPorMes;
    private _calcularTendenciaLinear;
}
//# sourceMappingURL=projects.service.d.ts.map