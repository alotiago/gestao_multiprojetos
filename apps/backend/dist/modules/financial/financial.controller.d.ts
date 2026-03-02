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
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
    }>;
    findImpostos(id: string, ano?: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        aliquota: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createImposto(dto: CreateImpostoDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        aliquota: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateImposto(id: string, dto: UpdateImpostoDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        aliquota: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteImposto(id: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
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
        custoFixo: import("@prisma/client/runtime/library").Decimal;
        custoVariavel: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    upsertCustoMensal(dto: CreateCustoMensalDto): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        colaboradorId: string;
        custoFixo: import("@prisma/client/runtime/library").Decimal;
        custoVariavel: import("@prisma/client/runtime/library").Decimal;
    }>;
    findIndices(tipo?: string, ano?: string): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }[]>;
    createIndice(dto: CreateIndiceFinanceiroDto): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        valor: import("@prisma/client/runtime/library").Decimal;
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
        tipo: string;
        createdAt: Date;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string;
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
        valor: import("@prisma/client/runtime/library").Decimal;
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
    findAllReceitas(page?: string, limit?: string, ano?: string): Promise<{
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
                valorUnitario: import("@prisma/client/runtime/library").Decimal;
                descricaoItem: string;
                quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
                valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
            valorUnitario: import("@prisma/client/runtime/library").Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
            valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
                valorUnitario: import("@prisma/client/runtime/library").Decimal;
                descricaoItem: string;
                quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
                valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
            valorUnitario: import("@prisma/client/runtime/library").Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
            valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
            valorUnitario: import("@prisma/client/runtime/library").Decimal;
            descricaoItem: string;
            quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
            valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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