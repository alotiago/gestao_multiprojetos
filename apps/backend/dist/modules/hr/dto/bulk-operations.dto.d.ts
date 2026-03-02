import { UserStatus } from '@prisma/client';
/**
 * DTO para cada colaborador na importação em lote
 */
export declare class BulkColaboradorItemDto {
    matricula: string;
    nome: string;
    email?: string;
    cargo: string;
    classe?: string;
    taxaHora: number;
    cargaHoraria: number;
    cidade: string;
    estado: string;
    sindicatoId?: string;
    status?: UserStatus;
    dataAdmissao: string;
    dataDesligamento?: string;
}
/**
 * DTO para importação em lote de colaboradores
 */
export declare class BulkImportColaboradorDto {
    colaboradores: BulkColaboradorItemDto[];
    descricaoOperacao?: string;
}
/**
 * DTO para bulk update de jornadas
 */
export declare class BulkUpdateJornadaDto {
    jornadas: BulkJornadaItemDto[];
    motivo: string;
}
export declare class BulkJornadaItemDto {
    colaboradorId: string;
    mes: number;
    ano: number;
    horasPrevistas: number;
    projectId?: string;
}
/**
 * Resultado de bulk operation
 */
export declare class BulkOperationResultDto {
    totalProcessado: number;
    sucessos: number;
    erros: number;
    avisos: number;
    detalhes: {
        identificador: string;
        status: 'sucesso' | 'erro' | 'aviso';
        mensagem: string;
        entityId?: string;
    }[];
}
//# sourceMappingURL=bulk-operations.dto.d.ts.map