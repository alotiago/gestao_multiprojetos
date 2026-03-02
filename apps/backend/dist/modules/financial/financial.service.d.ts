import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateDespesaDto, UpdateDespesaDto, FilterDespesaDto } from './dto/despesa.dto';
import { CreateImpostoDto, UpdateImpostoDto, CalcularImpostosDto, RegimeTributario, CreateIndiceFinanceiroDto } from './dto/imposto.dto';
import { CreateCustoMensalDto } from './dto/custo-mensal.dto';
import { CreateProvisaoDto, UpdateProvisaoDto, FilterProvisaoDto } from './dto/provisao.dto';
import { BulkImportDespesaDto, BulkImportProvisaoDto, CalculoTributarioSindicatoDto } from './dto/bulk-operations.dto';
export declare class FinancialService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findDespesas(filters: FilterDespesaDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }[]>;
    findDespesaById(id: string): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    createDespesa(dto: CreateDespesaDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    updateDespesa(id: string, dto: UpdateDespesaDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    deleteDespesa(id: string): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    findImpostos(projectId: string, ano?: number): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
        aliquota: Decimal;
    }[]>;
    createImposto(dto: CreateImpostoDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
        aliquota: Decimal;
    }>;
    updateImposto(id: string, dto: UpdateImpostoDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
        aliquota: Decimal;
    }>;
    deleteImposto(id: string): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
        aliquota: Decimal;
    }>;
    calcularImpostos(dto: CalcularImpostosDto): Promise<{
        projectId: string;
        mes: number;
        ano: number;
        regime: RegimeTributario;
        receitaBruta: number;
        impostos: {
            tipo: string;
            aliquota: number;
            valor: number;
        }[];
        totalImpostos: number;
        cargaTributaria: number;
    }>;
    gravarImpostosCalculados(dto: CalcularImpostosDto): Promise<{
        projectId: string;
        mes: number;
        ano: number;
        regime: RegimeTributario;
        receitaBruta: number;
        impostos: {
            tipo: string;
            aliquota: number;
            valor: number;
        }[];
        totalImpostos: number;
        cargaTributaria: number;
    }>;
    findCustosMensais(projectId: string, ano?: number): Promise<({
        colaborador: {
            id: string;
            matricula: string;
            nome: string;
            cargo: string;
        };
    } & {
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        colaboradorId: string;
        custoFixo: Decimal;
        custoVariavel: Decimal;
    })[]>;
    upsertCustoMensal(dto: CreateCustoMensalDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        colaboradorId: string;
        custoFixo: Decimal;
        custoVariavel: Decimal;
    }>;
    findIndices(tipo?: string, ano?: number): Promise<{
        id: string;
        createdAt: Date;
        tipo: string;
        valor: Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }[]>;
    createIndice(dto: CreateIndiceFinanceiroDto): Promise<{
        id: string;
        createdAt: Date;
        tipo: string;
        valor: Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }>;
    calcularCustoTotal(projectId: string, mes: number, ano: number): Promise<{
        projectId: string;
        mes: number;
        ano: number;
        totalDespesas: number;
        despesasPorTipo: Record<string, number>;
        totalImpostos: number;
        impostosPorTipo: Record<string, number>;
        totalCustosPessoal: number;
        custoTotal: number;
    }>;
    calcularCustoAnual(projectId: string, ano: number): Promise<{
        projectId: string;
        ano: number;
        mensais: {
            projectId: string;
            mes: number;
            ano: number;
            totalDespesas: number;
            despesasPorTipo: Record<string, number>;
            totalImpostos: number;
            impostosPorTipo: Record<string, number>;
            totalCustosPessoal: number;
            custoTotal: number;
        }[];
        totalAnual: {
            totalDespesas: number;
            totalImpostos: number;
            totalCustosPessoal: number;
            custoTotal: number;
        };
    }>;
    private validateProject;
    findProvisoes(filters: FilterProvisaoDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }[]>;
    findProvisaoById(id: string): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    createProvisao(dto: CreateProvisaoDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    updateProvisao(id: string, dto: UpdateProvisaoDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    deleteProvisao(id: string): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        tipo: string;
        projectId: string;
        valor: Decimal;
    }>;
    importarDespesasEmLote(dto: BulkImportDespesaDto, userId?: string): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: {
            indice: number;
            status: string;
            mensagem: string;
            entityId?: string;
        }[];
    }>;
    importarProvisoesEmLote(dto: BulkImportProvisaoDto, userId?: string): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: {
            indice: number;
            status: string;
            mensagem: string;
            entityId?: string;
        }[];
    }>;
    calcularImpactoTributarioSindicato(dto: CalculoTributarioSindicatoDto): Promise<{
        sindicato: {
            id: any;
            nome: any;
            regiao: any;
            percentualDissidio: number;
        } | null;
        impactoDissidio: number;
        ipca: number;
        custoTotalComImpacto: number;
        projectId: string;
        mes: number;
        ano: number;
        regime: RegimeTributario;
        receitaBruta: number;
        impostos: {
            tipo: string;
            aliquota: number;
            valor: number;
        }[];
        totalImpostos: number;
        cargaTributaria: number;
    }>;
    calcularCustoTotalCompleto(projectId: string, mes: number, ano: number): Promise<{
        projectId: string;
        mes: number;
        ano: number;
        totalDespesas: number;
        despesasPorTipo: Record<string, number>;
        totalImpostos: number;
        impostosPorTipo: Record<string, number>;
        totalCustosPessoal: number;
        totalProvisoes: number;
        provisoesPorTipo: Record<string, number>;
        custoTotal: number;
    }>;
    private readonly receitaInclude;
    findAllReceitas(page?: number, limit?: number, ano?: number): Promise<{
        data: ({
            project: {
                id: string;
                nome: string;
                codigo: string;
            };
            objetoContratual: {
                id: string;
                descricao: string;
                numero: string;
            } | null;
            linhaContratual: {
                id: string;
                descricaoItem: string;
                unidade: string;
                quantidadeAnualEstimada: Decimal;
                valorUnitario: Decimal;
                valorTotalAnual: Decimal;
            } | null;
        } & {
            mes: number;
            ano: number;
            id: string;
            descricao: string | null;
            createdAt: Date;
            ativo: boolean;
            updatedAt: Date;
            projectId: string;
            objetoContratualId: string | null;
            unidade: string | null;
            valorUnitario: Decimal | null;
            linhaContratualId: string | null;
            tipoReceita: string;
            quantidade: Decimal | null;
            valorPrevisto: Decimal;
            valorRealizado: Decimal;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findReceitasById(projectId: string, ano?: number): Promise<({
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            numero: string;
        } | null;
        linhaContratual: {
            id: string;
            descricaoItem: string;
            unidade: string;
            quantidadeAnualEstimada: Decimal;
            valorUnitario: Decimal;
            valorTotalAnual: Decimal;
        } | null;
    } & {
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        objetoContratualId: string | null;
        unidade: string | null;
        valorUnitario: Decimal | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        quantidade: Decimal | null;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
    })[]>;
    /**
     * Buscar receitas agregadas por Objeto Contratual
     * US3 — Receita agregada ao objeto contratual
     */
    findReceitasByObjeto(objetoContratualId: string, ano?: number): Promise<{
        objetoContratualId: string;
        receitas: ({
            project: {
                id: string;
                nome: string;
                codigo: string;
            };
            objetoContratual: {
                id: string;
                descricao: string;
                numero: string;
            } | null;
            linhaContratual: {
                id: string;
                descricaoItem: string;
                unidade: string;
                quantidadeAnualEstimada: Decimal;
                valorUnitario: Decimal;
                valorTotalAnual: Decimal;
            } | null;
        } & {
            mes: number;
            ano: number;
            id: string;
            descricao: string | null;
            createdAt: Date;
            ativo: boolean;
            updatedAt: Date;
            projectId: string;
            objetoContratualId: string | null;
            unidade: string | null;
            valorUnitario: Decimal | null;
            linhaContratualId: string | null;
            tipoReceita: string;
            quantidade: Decimal | null;
            valorPrevisto: Decimal;
            valorRealizado: Decimal;
        })[];
        totais: {
            totalPrevisto: number;
            totalRealizado: number;
            totalReceitas: number;
        };
    }>;
    /**
     * Criar receita — suporta dois modos:
     * 1. Via Contrato: linhaContratualId + quantidade → auto-calcula valor
     * 2. Manual: valorPrevisto direto
     *
     * Fluxo Via Contrato (US1 + US2):
     * - Busca linha contratual automaticamente
     * - Auto-preenche: descrição, unidade, valorUnitário
     * - Calcula: valorPrevisto = quantidade × valorUnitário
     * - Vincula ao projeto, objeto e linha (US3)
     */
    createReceita(data: any): Promise<{
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            numero: string;
        } | null;
        linhaContratual: {
            id: string;
            descricaoItem: string;
            unidade: string;
            quantidadeAnualEstimada: Decimal;
            valorUnitario: Decimal;
            valorTotalAnual: Decimal;
        } | null;
    } & {
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        objetoContratualId: string | null;
        unidade: string | null;
        valorUnitario: Decimal | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        quantidade: Decimal | null;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
    }>;
    /**
     * Atualizar receita — US4: Atualização Dinâmica
     * Se quantidade é alterada e há linha contratual → recalcula valorPrevisto
     */
    updateReceita(id: string, data: any): Promise<{
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            numero: string;
        } | null;
        linhaContratual: {
            id: string;
            descricaoItem: string;
            unidade: string;
            quantidadeAnualEstimada: Decimal;
            valorUnitario: Decimal;
            valorTotalAnual: Decimal;
        } | null;
    } & {
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        objetoContratualId: string | null;
        unidade: string | null;
        valorUnitario: Decimal | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        quantidade: Decimal | null;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
    }>;
    deleteReceita(id: string): Promise<{
        mes: number;
        ano: number;
        id: string;
        descricao: string | null;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        objetoContratualId: string | null;
        unidade: string | null;
        valorUnitario: Decimal | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        quantidade: Decimal | null;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
    }>;
}
//# sourceMappingURL=financial.service.d.ts.map