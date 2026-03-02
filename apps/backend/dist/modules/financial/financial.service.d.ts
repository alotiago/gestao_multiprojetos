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
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }[]>;
    findDespesaById(id: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }>;
    createDespesa(dto: CreateDespesaDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }>;
    updateDespesa(id: string, dto: UpdateDespesaDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }>;
    deleteDespesa(id: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }>;
    findImpostos(projectId: string, ano?: number): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
        aliquota: Decimal;
    }[]>;
    createImposto(dto: CreateImpostoDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
        aliquota: Decimal;
    }>;
    updateImposto(id: string, dto: UpdateImpostoDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
        aliquota: Decimal;
    }>;
    deleteImposto(id: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
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
            nome: string;
            id: string;
            matricula: string;
            cargo: string;
        };
    } & {
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        colaboradorId: string;
        custoFixo: Decimal;
        custoVariavel: Decimal;
    })[]>;
    upsertCustoMensal(dto: CreateCustoMensalDto): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        colaboradorId: string;
        custoFixo: Decimal;
        custoVariavel: Decimal;
    }>;
    findIndices(tipo?: string, ano?: number): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        valor: Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }[]>;
    createIndice(dto: CreateIndiceFinanceiroDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
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
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }[]>;
    findProvisaoById(id: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }>;
    createProvisao(dto: CreateProvisaoDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }>;
    updateProvisao(id: string, dto: UpdateProvisaoDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: Decimal;
    }>;
    deleteProvisao(id: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
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
                codigo: string;
                nome: string;
                id: string;
            };
            objetoContratual: {
                id: string;
                descricao: string;
                numero: never;
            } | null;
            linhaContratual: {
                id: string;
                unidade: string;
                valorUnitario: Decimal;
                descricaoItem: string;
                quantidadeAnualEstimada: Decimal;
                valorTotalAnual: Decimal;
            } | null;
        } & {
            createdAt: Date;
            id: string;
            descricao: string | null;
            ativo: boolean;
            updatedAt: Date;
            mes: number;
            ano: number;
            projectId: string;
            objetoContratualId: string | null;
            linhaContratualId: string | null;
            tipoReceita: string;
            unidade: string | null;
            quantidadePlanejada: Decimal | null;
            valorUnitarioPlanejado: Decimal | null;
            valorPlanejado: Decimal;
            quantidadeRealizada: Decimal | null;
            valorUnitarioRealizado: Decimal | null;
            valorRealizado: Decimal;
            quantidade: Decimal | null;
            valorUnitario: Decimal | null;
            valorPrevisto: Decimal;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findReceitasById(projectId: string, ano?: number): Promise<({
        project: {
            codigo: string;
            nome: string;
            id: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            numero: never;
        } | null;
        linhaContratual: {
            id: string;
            unidade: string;
            valorUnitario: Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: Decimal;
            valorTotalAnual: Decimal;
        } | null;
    } & {
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: Decimal | null;
        valorUnitarioPlanejado: Decimal | null;
        valorPlanejado: Decimal;
        quantidadeRealizada: Decimal | null;
        valorUnitarioRealizado: Decimal | null;
        valorRealizado: Decimal;
        quantidade: Decimal | null;
        valorUnitario: Decimal | null;
        valorPrevisto: Decimal;
    })[]>;
    /**
     * Buscar receitas agregadas por Objeto Contratual
     * US3 — Receita agregada ao objeto contratual
     */
    findReceitasByObjeto(objetoContratualId: string, ano?: number): Promise<{
        objetoContratualId: string;
        receitas: ({
            project: {
                codigo: string;
                nome: string;
                id: string;
            };
            objetoContratual: {
                id: string;
                descricao: string;
                numero: never;
            } | null;
            linhaContratual: {
                id: string;
                unidade: string;
                valorUnitario: Decimal;
                descricaoItem: string;
                quantidadeAnualEstimada: Decimal;
                valorTotalAnual: Decimal;
            } | null;
        } & {
            createdAt: Date;
            id: string;
            descricao: string | null;
            ativo: boolean;
            updatedAt: Date;
            mes: number;
            ano: number;
            projectId: string;
            objetoContratualId: string | null;
            linhaContratualId: string | null;
            tipoReceita: string;
            unidade: string | null;
            quantidadePlanejada: Decimal | null;
            valorUnitarioPlanejado: Decimal | null;
            valorPlanejado: Decimal;
            quantidadeRealizada: Decimal | null;
            valorUnitarioRealizado: Decimal | null;
            valorRealizado: Decimal;
            quantidade: Decimal | null;
            valorUnitario: Decimal | null;
            valorPrevisto: Decimal;
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
            codigo: string;
            nome: string;
            id: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            numero: never;
        } | null;
        linhaContratual: {
            id: string;
            unidade: string;
            valorUnitario: Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: Decimal;
            valorTotalAnual: Decimal;
        } | null;
    } & {
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: Decimal | null;
        valorUnitarioPlanejado: Decimal | null;
        valorPlanejado: Decimal;
        quantidadeRealizada: Decimal | null;
        valorUnitarioRealizado: Decimal | null;
        valorRealizado: Decimal;
        quantidade: Decimal | null;
        valorUnitario: Decimal | null;
        valorPrevisto: Decimal;
    }>;
    /**
     * Atualizar receita — US4: Atualização Dinâmica
     * Se quantidade é alterada e há linha contratual → recalcula valorPrevisto
     */
    updateReceita(id: string, data: any): Promise<{
        project: {
            codigo: string;
            nome: string;
            id: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            numero: never;
        } | null;
        linhaContratual: {
            id: string;
            unidade: string;
            valorUnitario: Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: Decimal;
            valorTotalAnual: Decimal;
        } | null;
    } & {
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: Decimal | null;
        valorUnitarioPlanejado: Decimal | null;
        valorPlanejado: Decimal;
        quantidadeRealizada: Decimal | null;
        valorUnitarioRealizado: Decimal | null;
        valorRealizado: Decimal;
        quantidade: Decimal | null;
        valorUnitario: Decimal | null;
        valorPrevisto: Decimal;
    }>;
    deleteReceita(id: string): Promise<{
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: Decimal | null;
        valorUnitarioPlanejado: Decimal | null;
        valorPlanejado: Decimal;
        quantidadeRealizada: Decimal | null;
        valorUnitarioRealizado: Decimal | null;
        valorRealizado: Decimal;
        quantidade: Decimal | null;
        valorUnitario: Decimal | null;
        valorPrevisto: Decimal;
    }>;
}
//# sourceMappingURL=financial.service.d.ts.map