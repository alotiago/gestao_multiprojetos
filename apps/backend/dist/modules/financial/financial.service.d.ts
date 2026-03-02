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
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findDespesaById(id: string): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDespesa(dto: CreateDespesaDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateDespesa(id: string, dto: UpdateDespesaDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        descricao: string;
        valor: Decimal;
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
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findImpostos(projectId: string, ano?: number): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        aliquota: Decimal;
    }[]>;
    createImposto(dto: CreateImpostoDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        aliquota: Decimal;
    }>;
    updateImposto(id: string, dto: UpdateImpostoDto): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        aliquota: Decimal;
    }>;
    deleteImposto(id: string): Promise<{
        id: string;
        projectId: string;
        tipo: string;
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
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
        id: string;
        projectId: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        colaboradorId: string;
        custoFixo: Decimal;
        custoVariavel: Decimal;
    })[]>;
    upsertCustoMensal(dto: CreateCustoMensalDto): Promise<{
        id: string;
        projectId: string;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        colaboradorId: string;
        custoFixo: Decimal;
        custoVariavel: Decimal;
    }>;
    findIndices(tipo?: string, ano?: number): Promise<{
        id: string;
        tipo: string;
        valor: Decimal;
        createdAt: Date;
        mesReferencia: number;
        anoReferencia: number;
    }[]>;
    createIndice(dto: CreateIndiceFinanceiroDto): Promise<{
        id: string;
        tipo: string;
        valor: Decimal;
        createdAt: Date;
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
        id: string;
        projectId: string;
        tipo: string;
        descricao: string | null;
        valor: Decimal;
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
        valor: Decimal;
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
        valor: Decimal;
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
        valor: Decimal;
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
        valor: Decimal;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
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
    findAllReceitas(page?: number, limit?: number, ano?: number): Promise<{
        data: ({
            project: {
                id: string;
                nome: string;
                codigo: string;
            };
        } & {
            id: string;
            projectId: string;
            descricao: string | null;
            mes: number;
            ano: number;
            createdAt: Date;
            updatedAt: Date;
            ativo: boolean;
            tipoReceita: string;
            valorPrevisto: Decimal;
            valorRealizado: Decimal;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findReceitasById(projectId: string, ano?: number): Promise<{
        id: string;
        projectId: string;
        descricao: string | null;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
        tipoReceita: string;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
    }[]>;
    createReceita(data: any): Promise<{
        id: string;
        projectId: string;
        descricao: string | null;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
        tipoReceita: string;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
    }>;
    updateReceita(id: string, data: any): Promise<{
        id: string;
        projectId: string;
        descricao: string | null;
        mes: number;
        ano: number;
        createdAt: Date;
        updatedAt: Date;
        ativo: boolean;
        tipoReceita: string;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
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
        tipoReceita: string;
        valorPrevisto: Decimal;
        valorRealizado: Decimal;
    }>;
}
//# sourceMappingURL=financial.service.d.ts.map