import { ProjectStatus } from '@prisma/client';
/**
 * DTO para cada projeto na importação em lote
 */
export declare class BulkProjectItemDto {
    codigo: string;
    nome: string;
    cliente: string;
    unitId: string;
    status?: ProjectStatus;
    tipo: string;
    dataInicio: string;
    dataFim?: string;
    descricao?: string;
}
/**
 * DTO para importação em lote de projetos
 */
export declare class BulkImportProjectDto {
    projetos: BulkProjectItemDto[];
    descricaoOperacao?: string;
}
/**
 * Resultado de importação
 */
export declare class BulkImportResultDto {
    totalProcessado: number;
    sucessos: number;
    erros: number;
    avisos: number;
    detalhes: {
        codigo: string;
        status: 'sucesso' | 'erro' | 'aviso';
        mensagem: string;
        projetoId?: string;
    }[];
}
//# sourceMappingURL=bulk-import-project.dto.d.ts.map