import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    findAll(page?: string, limit?: string, status?: string): Promise<{
        data: ({
            _count: {
                objetos: number;
                projetos: number;
            };
            objetos: {
                id: string;
                nome: string;
                valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
            }[];
        } & {
            id: string;
            status: string;
            ativo: boolean;
            createdAt: Date;
            updatedAt: Date;
            cliente: string;
            dataInicio: Date;
            dataFim: Date | null;
            nomeContrato: string;
            numeroContrato: string;
            observacoes: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findDisponíveis(): Promise<{
        id: string;
        cliente: string;
        dataInicio: Date;
        dataFim: Date | null;
        nomeContrato: string;
        numeroContrato: string;
    }[]>;
    findById(id: string): Promise<{
        objetos: any[];
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal;
        _count: {
            objetos: number;
            projetos: number;
        };
        projetos: {
            id: string;
            codigo: string;
            nome: string;
        }[];
        id: string;
        status: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cliente: string;
        dataInicio: Date;
        dataFim: Date | null;
        nomeContrato: string;
        numeroContrato: string;
        observacoes: string | null;
    }>;
    create(data: {
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: string;
        dataFim?: string;
        status?: string;
        observacoes?: string;
    }): Promise<{
        _count: {
            objetos: number;
            projetos: number;
        };
    } & {
        id: string;
        status: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cliente: string;
        dataInicio: Date;
        dataFim: Date | null;
        nomeContrato: string;
        numeroContrato: string;
        observacoes: string | null;
    }>;
    update(id: string, data: {
        nomeContrato?: string;
        cliente?: string;
        numeroContrato?: string;
        dataInicio?: string;
        dataFim?: string;
        status?: string;
        observacoes?: string;
    }): Promise<{
        _count: {
            objetos: number;
            projetos: number;
        };
    } & {
        id: string;
        status: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cliente: string;
        dataInicio: Date;
        dataFim: Date | null;
        nomeContrato: string;
        numeroContrato: string;
        observacoes: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        status: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cliente: string;
        dataInicio: Date;
        dataFim: Date | null;
        nomeContrato: string;
        numeroContrato: string;
        observacoes: string | null;
    }>;
    clone(id: string, data: {
        novoNome: string;
        novoNumero: string;
    }): Promise<{
        objetos: any[];
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal;
        _count: {
            objetos: number;
            projetos: number;
        };
        projetos: {
            id: string;
            codigo: string;
            nome: string;
        }[];
        id: string;
        status: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        cliente: string;
        dataInicio: Date;
        dataFim: Date | null;
        nomeContrato: string;
        numeroContrato: string;
        observacoes: string | null;
    }>;
    createObjeto(contratoId: string, data: {
        nome: string;
        descricao: string;
        dataInicio: string;
        dataFim?: string;
        observacoes?: string;
    }): Promise<{
        contrato: {
            id: string;
            nomeContrato: string;
        };
        _count: {
            linhasContratuais: number;
        };
    } & {
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        contratoId: string;
        dataInicio: Date | null;
        dataFim: Date | null;
        descricao: string;
        observacoes: string | null;
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateObjeto(id: string, data: {
        nome?: string;
        descricao?: string;
        dataInicio?: string;
        dataFim?: string;
        observacoes?: string;
    }): Promise<{
        contrato: {
            id: string;
            nomeContrato: string;
        };
    } & {
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        contratoId: string;
        dataInicio: Date | null;
        dataFim: Date | null;
        descricao: string;
        observacoes: string | null;
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    deleteObjeto(id: string): Promise<{
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        contratoId: string;
        dataInicio: Date | null;
        dataFim: Date | null;
        descricao: string;
        observacoes: string | null;
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    createLinha(objetoContratualId: string, data: {
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: number;
        valorUnitario: number;
    }): Promise<{
        objetoContratual: {
            id: string;
            nome: string;
            contratoId: string;
        };
    } & {
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        objetoContratualId: string;
        unidade: string;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        descricaoItem: string;
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
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
            nome: string;
            contratoId: string;
        };
    } & {
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        objetoContratualId: string;
        unidade: string;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        descricaoItem: string;
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
    }>;
    deleteLinha(id: string): Promise<void>;
    getObjetosByProject(projectId: string): Promise<{
        id: string;
        nome: string;
        dataInicio: Date | null;
        dataFim: Date | null;
        descricao: string;
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getLinhasByObjeto(objetoId: string): Promise<{
        id: string;
        unidade: string;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        descricaoItem: string;
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getProjectSummary(projectId: string): Promise<{
        projectId: string;
        contratoId: null;
        totalObjetos: number;
        totalLinhas: number;
        valorTotalContratado: number;
        objetos: never[];
        nomeContrato?: undefined;
        numeroContrato?: undefined;
    } | {
        projectId: string;
        contratoId: string;
        nomeContrato: string;
        numeroContrato: string;
        totalObjetos: number;
        totalLinhas: number;
        valorTotalContratado: number;
        objetos: {
            id: any;
            nome: any;
            totalLinhas: any;
            valorTotal: any;
            linhas: any;
        }[];
    }>;
}
//# sourceMappingURL=contracts.controller.d.ts.map