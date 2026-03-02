import { PrismaService } from '../../prisma/prisma.service';
export declare class ContractsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllObjetos(page?: number, limit?: number, projectId?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
    }>;
    findObjetoById(id: string): Promise<any>;
    findObjetosByProject(projectId: string): Promise<any>;
    createObjeto(data: {
        projectId: string;
        numero: string;
        descricao: string;
        dataInicio: string;
        dataFim?: string;
    }): Promise<any>;
    updateObjeto(id: string, data: {
        descricao?: string;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<any>;
    deleteObjeto(id: string): Promise<void>;
    findLinhasByObjeto(objetoContratualId: string): Promise<any>;
    findLinhaById(id: string): Promise<any>;
    findLinhasByProject(projectId: string): Promise<any>;
    createLinha(data: {
        objetoContratualId: string;
        descricaoItem: string;
        unidade: string;
        quantidadeAnualEstimada: number;
        valorUnitario: number;
    }): Promise<any>;
    updateLinha(id: string, data: {
        descricaoItem?: string;
        unidade?: string;
        quantidadeAnualEstimada?: number;
        valorUnitario?: number;
    }): Promise<any>;
    deleteLinha(id: string): Promise<void>;
}
//# sourceMappingURL=contracts.service.d.ts.map