import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class ContractsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    /**
     * Recalcula o valorTotalContratado de um ObjetoContratual
     * como a soma dos valorTotalAnual de suas linhas ativas
     */
    private recalcularTotalObjeto;
    findAllObjetos(page?: number, limit?: number, projectId?: string): Promise<{
        data: {
            valorTotalContratado: number;
            _count: {
                linhasContratuais: number;
            };
            project: {
                id: string;
                nome: string;
                codigo: string;
            };
            id: string;
            descricao: string;
            createdAt: Date;
            ativo: boolean;
            updatedAt: Date;
            projectId: string;
            numero: string;
            dataInicio: Date;
            dataFim: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findObjetoById(id: string): Promise<{
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
        linhasContratuais: {
            id: string;
            createdAt: Date;
            ativo: boolean;
            updatedAt: Date;
            objetoContratualId: string;
            descricaoItem: string;
            unidade: string;
            quantidadeAnualEstimada: Decimal;
            valorUnitario: Decimal;
            valorTotalAnual: Decimal;
        }[];
    } & {
        id: string;
        descricao: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        numero: string;
        dataInicio: Date;
        dataFim: Date | null;
        valorTotalContratado: Decimal | null;
    }>;
    findObjetosByProject(projectId: string): Promise<{
        valorTotalContratado: number;
        _count: {
            linhasContratuais: number;
        };
        id: string;
        descricao: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        numero: string;
        dataInicio: Date;
        dataFim: Date | null;
    }[]>;
    /**
     * Resumo financeiro contratual do projeto
     * Total contratado = soma de todos os objetos contratuais
     */
    getProjectContractSummary(projectId: string): Promise<{
        projectId: string;
        totalObjetos: number;
        totalContratadoProjeto: number;
        objetos: {
            id: string;
            numero: string;
            descricao: string;
            totalLinhas: number;
            totalReceitas: number;
            valorTotalContratado: number;
            linhas: {
                id: string;
                descricaoItem: string;
                unidade: string;
                quantidadeAnualEstimada: Decimal;
                valorUnitario: Decimal;
                valorTotalAnual: Decimal;
            }[];
        }[];
    }>;
    createObjeto(data: {
        projectId: string;
        numero: string;
        descricao: string;
        dataInicio: string;
        dataFim?: string;
    }): Promise<{
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
    } & {
        id: string;
        descricao: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        numero: string;
        dataInicio: Date;
        dataFim: Date | null;
        valorTotalContratado: Decimal | null;
    }>;
    updateObjeto(id: string, data: {
        descricao?: string;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<{
        project: {
            id: string;
            nome: string;
            codigo: string;
        };
    } & {
        id: string;
        descricao: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        projectId: string;
        numero: string;
        dataInicio: Date;
        dataFim: Date | null;
        valorTotalContratado: Decimal | null;
    }>;
    deleteObjeto(id: string): Promise<void>;
    findLinhasByObjeto(objetoContratualId: string): Promise<({
        objetoContratual: {
            id: string;
            descricao: string;
            projectId: string;
            numero: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        objetoContratualId: string;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: Decimal;
        valorUnitario: Decimal;
        valorTotalAnual: Decimal;
    })[]>;
    findLinhaById(id: string): Promise<{
        objetoContratual: {
            id: string;
            descricao: string;
            project: {
                id: string;
                nome: string;
                codigo: string;
            };
            projectId: string;
            numero: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        objetoContratualId: string;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: Decimal;
        valorUnitario: Decimal;
        valorTotalAnual: Decimal;
    }>;
    findLinhasByProject(projectId: string): Promise<({
        objetoContratual: {
            id: string;
            descricao: string;
            numero: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        objetoContratualId: string;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: Decimal;
        valorUnitario: Decimal;
        valorTotalAnual: Decimal;
    })[]>;
    createLinha(data: {
        objetoContratualId: string;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: number;
        valorUnitario: number;
    }): Promise<{
        objetoContratual: {
            id: string;
            descricao: string;
            projectId: string;
            numero: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        objetoContratualId: string;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: Decimal;
        valorUnitario: Decimal;
        valorTotalAnual: Decimal;
    }>;
    updateLinha(id: string, data: {
        descricaoItem?: string;
        unidade?: string;
        quantidadeAnualEstimada?: number;
        valorUnitario?: number;
    }): Promise<{
        objetoContratual: {
            id: string;
            descricao: string;
            projectId: string;
            numero: string;
        };
    } & {
        id: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        objetoContratualId: string;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: Decimal;
        valorUnitario: Decimal;
        valorTotalAnual: Decimal;
    }>;
    deleteLinha(id: string): Promise<void>;
}
//# sourceMappingURL=contracts.service.d.ts.map