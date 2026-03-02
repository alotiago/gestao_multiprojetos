export declare class CreateSindicatoDto {
    nome: string;
    regiao: string;
    percentualDissidio: number;
    dataDissidio?: string;
    regimeTributario: string;
    descricao?: string;
    ativo?: boolean;
}
declare const UpdateSindicatoDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateSindicatoDto>>;
export declare class UpdateSindicatoDto extends UpdateSindicatoDto_base {
}
export declare class SimulacaoTrabalhistaDto {
    sindicatoId: string;
    salarioBase: number;
    mes: number;
    ano: number;
    horasExtras?: number;
    adicionalNoturno?: number;
}
export {};
//# sourceMappingURL=sindicato.dto.d.ts.map