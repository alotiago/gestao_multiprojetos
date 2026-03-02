export declare class CreateSindicatoDto {
    nome: string;
    regiao: string;
    percentualDissidio?: number;
    dataDissidio?: string;
    regimeTributario: string;
    descricao?: string;
}
export declare class UpdateSindicatoDto {
    nome?: string;
    regiao?: string;
    percentualDissidio?: number;
    dataDissidio?: string;
    regimeTributario?: string;
    descricao?: string;
    ativo?: boolean;
}
export declare class FilterSindicatoDto {
    regiao?: string;
    ativo?: boolean;
}
export declare class AplicarDissidioDto {
    sindicatoId: string;
    percentualReajuste: number;
    dataBase?: string;
}
export declare class SimulacaoTrabalhistaDto {
    sindicatoId: string;
    salarioBase: number;
    cargaHorariaMensal?: number;
}
//# sourceMappingURL=sindicato.dto.d.ts.map