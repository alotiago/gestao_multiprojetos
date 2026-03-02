export declare enum TipoFeriado {
    NACIONAL = "NACIONAL",
    ESTADUAL = "ESTADUAL",
    MUNICIPAL = "MUNICIPAL"
}
export declare class CreateCalendarioDto {
    data: string;
    tipoFeriado: TipoFeriado;
    descricao: string;
    cidade?: string;
    estado?: string;
    diaSemana: number;
    nacional?: boolean;
}
export declare class UpdateCalendarioDto {
    descricao?: string;
    tipoFeriado?: TipoFeriado;
    cidade?: string;
    estado?: string;
}
export declare class FilterCalendarioDto {
    ano?: number;
    estado?: string;
    cidade?: string;
    tipoFeriado?: TipoFeriado;
}
export declare class CalculoDiasUteisDto {
    mes: number;
    ano: number;
    estado?: string;
    cidade?: string;
}
export declare class BulkFeriadoItemDto {
    data: string;
    tipoFeriado: TipoFeriado;
    descricao: string;
    cidade?: string;
    estado?: string;
    diaSemana: number;
    nacional?: boolean;
}
export declare class BulkImportFeriadoDto {
    items: BulkFeriadoItemDto[];
    descricaoOperacao?: string;
}
//# sourceMappingURL=calendario.dto.d.ts.map