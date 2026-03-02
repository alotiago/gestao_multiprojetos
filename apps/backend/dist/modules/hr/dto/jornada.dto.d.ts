export declare class CreateJornadaDto {
    mes: number;
    ano: number;
    horasPrevistas: number;
    horasRealizadas?: number;
}
export declare class UpdateJornadaDto {
    horasPrevistas?: number;
    horasRealizadas?: number;
}
export declare class BulkJornadaDto {
    colaboradorIds: string[];
    mes: number;
    ano: number;
    horasPrevistas: number;
}
//# sourceMappingURL=jornada.dto.d.ts.map