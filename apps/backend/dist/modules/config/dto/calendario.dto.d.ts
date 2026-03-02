export declare enum FeriadoType {
    NACIONAL = "NACIONAL",
    ESTADUAL = "ESTADUAL",
    MUNICIPAL = "MUNICIPAL"
}
export declare class CreateCalendarioDto {
    data: string;
    tipoFeriado: FeriadoType;
    descricao: string;
    cidade?: string;
    estado?: string;
    nacional?: boolean;
}
declare const UpdateCalendarioDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCalendarioDto>>;
export declare class UpdateCalendarioDto extends UpdateCalendarioDto_base {
}
export declare class FilterCalendarioDto {
    tipoFeriado?: FeriadoType;
    estado?: string;
    cidade?: string;
    ano?: number;
    mes?: number;
}
export declare class HorasPrevistaDto {
    estado: string;
    mes: number;
    ano: number;
}
export {};
//# sourceMappingURL=calendario.dto.d.ts.map