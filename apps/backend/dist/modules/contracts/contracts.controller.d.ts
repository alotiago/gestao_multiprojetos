import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    findAllObjetos(page?: string, limit?: string, projectId?: string): Promise<{
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
            quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
            valorUnitario: import("@prisma/client/runtime/library").Decimal;
            valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
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
                quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
                valorUnitario: import("@prisma/client/runtime/library").Decimal;
                valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
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
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    deleteObjeto(id: string): Promise<void>;
    findLinhasByObjeto(objetoId: string): Promise<({
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
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
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
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteLinha(id: string): Promise<void>;
}
//# sourceMappingURL=contracts.controller.d.ts.map