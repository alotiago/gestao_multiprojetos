import { TipoDespesa } from './despesa.dto';
import { TipoProvisao } from './provisao.dto';
export declare class BulkDespesaItemDto {
    projectId: string;
    tipo: TipoDespesa;
    descricao: string;
    valor: number;
    mes: number;
    ano: number;
}
export declare class BulkImportDespesaDto {
    items: BulkDespesaItemDto[];
    descricaoOperacao?: string;
}
export declare class BulkProvisaoItemDto {
    projectId: string;
    tipo: TipoProvisao;
    descricao?: string;
    valor: number;
    mes: number;
    ano: number;
}
export declare class BulkImportProvisaoDto {
    items: BulkProvisaoItemDto[];
    descricaoOperacao?: string;
}
export declare class CalculoTributarioSindicatoDto {
    projectId: string;
    receitaBruta: number;
    sindicatoId?: string;
    estado?: string;
    mes: number;
    ano: number;
}
export declare class BulkOperationResultDto {
    totalProcessado: number;
    sucessos: number;
    erros: number;
    avisos: number;
    detalhes: Array<{
        indice: number;
        status: string;
        mensagem: string;
        entityId?: string;
    }>;
}
//# sourceMappingURL=bulk-operations.dto.d.ts.map