import { FinancialService } from './financial.service';
import { CreateDespesaDto, UpdateDespesaDto, FilterDespesaDto } from './dto/despesa.dto';
import { CreateImpostoDto, UpdateImpostoDto, CalcularImpostosDto, CreateIndiceFinanceiroDto } from './dto/imposto.dto';
import { CreateCustoMensalDto } from './dto/custo-mensal.dto';
import { CreateProvisaoDto, UpdateProvisaoDto, FilterProvisaoDto } from './dto/provisao.dto';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
import { BulkImportDespesaDto, BulkImportProvisaoDto, CalculoTributarioSindicatoDto } from './dto/bulk-operations.dto';
export declare class FinancialController {
    private readonly financialService;
    constructor(financialService: FinancialService);
    findDespesas(filters: FilterDespesaDto): Promise<{
        valor: number;
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findDespesaById(id: string): Promise<{
        valor: number;
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDespesa(dto: CreateDespesaDto): Promise<{
        valor: number;
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateDespesa(id: string, dto: UpdateDespesaDto): Promise<{
        valor: number;
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteDespesa(id: string): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findImpostos(id: string, ano?: string): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        aliquota: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createImposto(dto: CreateImpostoDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        aliquota: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateImposto(id: string, dto: UpdateImpostoDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        aliquota: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteImposto(id: string): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        aliquota: import("@prisma/client/runtime/library").Decimal;
    }>;
    calcularImpostos(dto: CalcularImpostosDto): Promise<{
        projectId: string;
        mes: number;
        ano: number;
        regime: import("./dto/imposto.dto").RegimeTributario;
        receitaBruta: number;
        impostos: {
            tipo: string;
            aliquota: number;
            valor: number;
        }[];
        totalImpostos: number;
        cargaTributaria: number;
    }>;
    gravarImpostos(dto: CalcularImpostosDto): Promise<{
        projectId: string;
        mes: number;
        ano: number;
        regime: import("./dto/imposto.dto").RegimeTributario;
        receitaBruta: number;
        impostos: {
            tipo: string;
            aliquota: number;
            valor: number;
        }[];
        totalImpostos: number;
        cargaTributaria: number;
    }>;
    findCustosMensais(id: string, ano?: string): Promise<({
        colaborador: {
            id: string;
            matricula: string;
            nome: string;
            cargo: string;
        };
    } & {
        id: string;
        projectId: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        colaboradorId: string;
        custoFixo: import("@prisma/client/runtime/library").Decimal;
        custoVariavel: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    upsertCustoMensal(dto: CreateCustoMensalDto): Promise<{
        id: string;
        projectId: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        colaboradorId: string;
        custoFixo: import("@prisma/client/runtime/library").Decimal;
        custoVariavel: import("@prisma/client/runtime/library").Decimal;
    }>;
    findIndices(tipo?: string, ano?: string): Promise<{
        id: string;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        mesReferencia: number;
        anoReferencia: number;
    }[]>;
    createIndice(dto: CreateIndiceFinanceiroDto): Promise<{
        id: string;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        mesReferencia: number;
        anoReferencia: number;
    }>;
    calcularCustoTotal(id: string, mes: string, ano: string): Promise<{
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
    calcularCustoAnual(id: string, ano: string): Promise<{
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
    findProvisoes(filters: FilterProvisaoDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string | null;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
    }[]>;
    findProvisaoById(id: string): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string | null;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
    }>;
    createProvisao(dto: CreateProvisaoDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string | null;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
    }>;
    updateProvisao(id: string, dto: UpdateProvisaoDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string | null;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
    }>;
    deleteProvisao(id: string): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string | null;
        valor: import("@prisma/client/runtime/library").Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
    }>;
    importarDespesasEmLote(dto: BulkImportDespesaDto, req: any): Promise<{
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
    importarProvisoesEmLote(dto: BulkImportProvisaoDto, req: any): Promise<{
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
    calcularImpactoTributario(dto: CalculoTributarioSindicatoDto): Promise<{
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
        regime: import("./dto/imposto.dto").RegimeTributario;
        receitaBruta: number;
        impostos: {
            tipo: string;
            aliquota: number;
            valor: number;
        }[];
        totalImpostos: number;
        cargaTributaria: number;
    }>;
    calcularCustoTotalCompleto(id: string, mes: string, ano: string): Promise<{
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
    findAllReceitas(page?: string, limit?: string, ano?: string, mes?: string, projectId?: string): Promise<{
        data: ({
            project: {
                id: string;
                nome: string;
                codigo: string;
            };
            objetoContratual: {
                id: string;
                descricao: string;
                nome: string;
            } | null;
            linhaContratual: {
                id: string;
                unidade: string;
                valorUnitario: import("@prisma/client/runtime/library").Decimal;
                descricaoItem: string;
                quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
                valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
            } | null;
        } & {
            id: string;
            projectId: string;
            descricao: string | null;
            mes: number;
            ano: number;
            createdAt: Date;
            updatedAt: Date;
            ativo: boolean;
            objetoContratualId: string | null;
            linhaContratualId: string | null;
            tipoReceita: string;
            unidade: string | null;
            quantidadePlanejada: import("@prisma/client/runtime/library").Decimal | null;
            valorUnitarioPlanejado: import("@prisma/client/runtime/library").Decimal | null;
            valorPlanejado: import("@prisma/client/runtime/library").Decimal;
            quantidadeRealizada: import("@prisma/client/runtime/library").Decimal | null;
            valorUnitarioRealizado: import("@prisma/client/runtime/library").Decimal | null;
            valorRealizado: import("@prisma/client/runtime/library").Decimal;
            quantidade: import("@prisma/client/runtime/library").Decimal | null;
            valorUnitario: import("@prisma/client/runtime/library").Decimal | null;
            valorPrevisto: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findReceitasById(projectId: string, ano?: string): Promise<({
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            nome: string;
        } | null;
        linhaContratual: {
            id: string;
            unidade: string;
            valorUnitario: import("@prisma/client/runtime/library").Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
            valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
        id: string;
        projectId: string;
        descricao: string | null;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioPlanejado: import("@prisma/client/runtime/library").Decimal | null;
        valorPlanejado: import("@prisma/client/runtime/library").Decimal;
        quantidadeRealizada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioRealizado: import("@prisma/client/runtime/library").Decimal | null;
        valorRealizado: import("@prisma/client/runtime/library").Decimal;
        quantidade: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitario: import("@prisma/client/runtime/library").Decimal | null;
        valorPrevisto: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findReceitasByObjeto(objetoContratualId: string, ano?: string): Promise<{
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
                nome: string;
            } | null;
            linhaContratual: {
                id: string;
                unidade: string;
                valorUnitario: import("@prisma/client/runtime/library").Decimal;
                descricaoItem: string;
                quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
                valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
            } | null;
        } & {
            id: string;
            projectId: string;
            descricao: string | null;
            mes: number;
            ano: number;
            createdAt: Date;
            updatedAt: Date;
            ativo: boolean;
            objetoContratualId: string | null;
            linhaContratualId: string | null;
            tipoReceita: string;
            unidade: string | null;
            quantidadePlanejada: import("@prisma/client/runtime/library").Decimal | null;
            valorUnitarioPlanejado: import("@prisma/client/runtime/library").Decimal | null;
            valorPlanejado: import("@prisma/client/runtime/library").Decimal;
            quantidadeRealizada: import("@prisma/client/runtime/library").Decimal | null;
            valorUnitarioRealizado: import("@prisma/client/runtime/library").Decimal | null;
            valorRealizado: import("@prisma/client/runtime/library").Decimal;
            quantidade: import("@prisma/client/runtime/library").Decimal | null;
            valorUnitario: import("@prisma/client/runtime/library").Decimal | null;
            valorPrevisto: import("@prisma/client/runtime/library").Decimal;
        })[];
        totais: {
            totalPrevisto: number;
            totalRealizado: number;
            totalReceitas: number;
        };
    }>;
    createReceita(dto: CreateReceitaDto): Promise<{
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            nome: string;
        } | null;
        linhaContratual: {
            id: string;
            unidade: string;
            valorUnitario: import("@prisma/client/runtime/library").Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
            valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
        id: string;
        projectId: string;
        descricao: string | null;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioPlanejado: import("@prisma/client/runtime/library").Decimal | null;
        valorPlanejado: import("@prisma/client/runtime/library").Decimal;
        quantidadeRealizada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioRealizado: import("@prisma/client/runtime/library").Decimal | null;
        valorRealizado: import("@prisma/client/runtime/library").Decimal;
        quantidade: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitario: import("@prisma/client/runtime/library").Decimal | null;
        valorPrevisto: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateReceita(id: string, dto: UpdateReceitaDto): Promise<{
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
        objetoContratual: {
            id: string;
            descricao: string;
            nome: string;
        } | null;
        linhaContratual: {
            id: string;
            unidade: string;
            valorUnitario: import("@prisma/client/runtime/library").Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
            valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
        id: string;
        projectId: string;
        descricao: string | null;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioPlanejado: import("@prisma/client/runtime/library").Decimal | null;
        valorPlanejado: import("@prisma/client/runtime/library").Decimal;
        quantidadeRealizada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioRealizado: import("@prisma/client/runtime/library").Decimal | null;
        valorRealizado: import("@prisma/client/runtime/library").Decimal;
        quantidade: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitario: import("@prisma/client/runtime/library").Decimal | null;
        valorPrevisto: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteReceita(id: string): Promise<{
        id: string;
        projectId: string;
        descricao: string | null;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
        objetoContratualId: string | null;
        linhaContratualId: string | null;
        tipoReceita: string;
        unidade: string | null;
        quantidadePlanejada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioPlanejado: import("@prisma/client/runtime/library").Decimal | null;
        valorPlanejado: import("@prisma/client/runtime/library").Decimal;
        quantidadeRealizada: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitarioRealizado: import("@prisma/client/runtime/library").Decimal | null;
        valorRealizado: import("@prisma/client/runtime/library").Decimal;
        quantidade: import("@prisma/client/runtime/library").Decimal | null;
        valorUnitario: import("@prisma/client/runtime/library").Decimal | null;
        valorPrevisto: import("@prisma/client/runtime/library").Decimal;
    }>;
}
//# sourceMappingURL=financial.controller.d.ts.map