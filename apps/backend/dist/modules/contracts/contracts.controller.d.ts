import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    findAllObjetos(page?: string, limit?: string, projectId?: string): Promise<{
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
    findLinhasByObjeto(objetoId: string): Promise<any>;
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
//# sourceMappingURL=contracts.controller.d.ts.map