import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class ContractsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    /**
     * US 1.1: Listar contratos com paginação
     */
    findAllContratos(page?: number, limit?: number, status?: string): Promise<{
        data: ({
            objetos: {
                id: string;
                nome: string;
                valorTotalContratado: Decimal | null;
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
    /**
     * US 1.2: Obter detalhe de contrato
     */
    findContratoById(id: string): Promise<{
        objetos: any[];
        valorTotalContratado: Decimal;
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
    /**
     * US 1.3: Criar contrato
     */
    createContrato(data: {
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
    /**
     * US 1.4: Atualizar contrato
     */
    updateContrato(id: string, data: {
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
    /**
     * US 1.5: Deletar contrato (soft delete)
     */
    deleteContrato(id: string): Promise<{
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
    /**
     * US 5.1: Clonar contrato com estrutura completa
     * Copia: Contrato + Objetos + Linhas
     * NÃO copia: Quantidades planejadas/realizadas, Receitas
     */
    cloneContrato(contratoId: string, novoNome: string, novoNumero: string): Promise<{
        objetos: any[];
        valorTotalContratado: Decimal;
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
    /**
     * Helper: Recalcula valorTotalContratado de um objeto
     */
    private recalcularTotalObjeto;
    /**
     * US 2.1: Criar objeto contratual
     */
    createObjeto(data: {
        contratoId: string;
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
        valorTotalContratado: Decimal | null;
    }>;
    /**
     * US 2.2: Atualizar objeto contratual
     */
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
        valorTotalContratado: Decimal | null;
    }>;
    /**
     * US 2.3: Deletar objeto contratual (soft delete)
     */
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
        valorTotalContratado: Decimal | null;
    }>;
    /**
     * US 3.1: Criar linha contratual
     */
    createLinha(data: {
        objetoContratualId: string;
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
        quantidadeAnualEstimada: Decimal;
        valorUnitario: Decimal;
        valorTotalAnual: Decimal;
        objetoContratualId: string;
    }>;
    /**
     * US 3.2: Atualizar linha contratual
     */
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
        quantidadeAnualEstimada: Decimal;
        valorUnitario: Decimal;
        valorTotalAnual: Decimal;
        objetoContratualId: string;
    }>;
    /**
     * US 3.3: Deletar linha contratual (soft delete)
     */
    deleteLinha(id: string): Promise<void>;
    /**
     * Obter contratos disponíveis para novo projeto
     */
    findContratosDisponíveis(): Promise<{
        id: string;
        nomeContrato: string;
        cliente: string;
        numeroContrato: string;
        dataInicio: Date;
        dataFim: Date | null;
    }[]>;
    /**
     * Resumo contratual por projeto
     */
    getProjectContractSummary(projectId: string): Promise<{
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
//# sourceMappingURL=contracts.service.d.ts.map