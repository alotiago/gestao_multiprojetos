export declare class BulkAjusteJornadaDto {
    projectId: string;
    mes: number;
    ano: number;
    colaboradorIds?: string[];
    horasRealizadas?: number;
    percentualAjuste?: number;
    motivo: string;
    criadoPor?: string;
}
export declare class BulkAjusteTaxaDto {
    colaboradorIds?: string[];
    percentualAjuste: number;
    mes?: number;
    ano?: number;
    motivo: string;
    criadoPor?: string;
}
export declare class RollbackMassivoDto {
    historicoId: string;
}
//# sourceMappingURL=mass-update.dto.d.ts.map