import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    findAll(page?: string, limit?: string, status?: string): Promise<{
        data: ({
            objetos: {
                id: string;
                nome: string;
                valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
            }[];
            _count: {
                objetos: number;
                projetos: number;
            };
        } & {
            id: string;
            nomeContrato: string;
            cliente: string;
            numeroContrato: string;
            dataInicio: Date;
            dataFim: Date | null;
            status: string;
            observacoes: string | null;
            ativo: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findDisponíveis(): Promise<{
        id: string;
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: Date;
        dataFim: Date | null;
    }[]>;
    findById(id: string): Promise<{
        objetos: any[];
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal;
        projetos: {
            id: string;
            nome: string;
            codigo: string;
        }[];
        _count: {
            objetos: number;
            projetos: number;
        };
        id: string;
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: Date;
        dataFim: Date | null;
        status: string;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: Date;
        dataFim: Date | null;
        status: string;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: Date;
        dataFim: Date | null;
        status: string;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        id: string;
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: Date;
        dataFim: Date | null;
        status: string;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    clone(id: string, data: {
        novoNome: string;
        novoNumero: string;
    }): Promise<{
        objetos: any[];
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal;
        projetos: {
            id: string;
            nome: string;
            codigo: string;
        }[];
        _count: {
            objetos: number;
            projetos: number;
        };
        id: string;
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: Date;
        dataFim: Date | null;
        status: string;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        dataInicio: Date | null;
        dataFim: Date | null;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        contratoId: string;
        nome: string;
        descricao: string;
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
        dataInicio: Date | null;
        dataFim: Date | null;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        contratoId: string;
        nome: string;
        descricao: string;
        valorTotalContratado: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    deleteObjeto(id: string): Promise<{
        id: string;
        dataInicio: Date | null;
        dataFim: Date | null;
        observacoes: string | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        contratoId: string;
        nome: string;
        descricao: string;
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
            contratoId: string;
            nome: string;
        };
    } & {
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
        objetoContratualId: string;
    }>;
    updateLinha(id: string, data: {
        descricaoItem?: string;
        unidade?: string;
        quantidadeAnualEstimada?: number;
        valorUnitario?: number;
    }): Promise<{
        objetoContratual: {
            id: string;
            contratoId: string;
            nome: string;
        };
    } & {
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: import("@prisma/client/runtime/library").Decimal;
        valorUnitario: import("@prisma/client/runtime/library").Decimal;
        valorTotalAnual: import("@prisma/client/runtime/library").Decimal;
        objetoContratualId: string;
    }>;
    deleteLinha(id: string): Promise<void>;
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