export declare enum TipoImposto {
    INSS = "INSS",
    ISS = "ISS",
    PIS = "PIS",
    COFINS = "COFINS",
    IRPJ = "IRPJ",
    CSLL = "CSLL",
    FGTS = "FGTS",
    CPP = "CPP",
    CPRB = "CPRB",
    OUTROS = "OUTROS"
}
export declare enum RegimeTributario {
    LUCRO_REAL = "LUCRO_REAL",
    LUCRO_PRESUMIDO = "LUCRO_PRESUMIDO",
    SIMPLES_NACIONAL = "SIMPLES_NACIONAL",
    CPRB = "CPRB"
}
export declare class CreateImpostoDto {
    projectId: string;
    tipo: TipoImposto;
    aliquota: number;
    valor: number;
    mes: number;
    ano: number;
}
export declare class UpdateImpostoDto {
    tipo?: TipoImposto;
    aliquota?: number;
    valor?: number;
}
export declare class CalcularImpostosDto {
    projectId: string;
    regime: RegimeTributario;
    receitaBruta: number;
    mes: number;
    ano: number;
    estado?: string;
}
export declare class CreateIndiceFinanceiroDto {
    tipo: string;
    valor: number;
    mesReferencia: number;
    anoReferencia: number;
}
//# sourceMappingURL=imposto.dto.d.ts.map