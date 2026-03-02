export declare enum TipoDespesa {
    FACILITIES = "facilities",
    FORNECEDOR = "fornecedor",
    ALUGUEL = "aluguel",
    ENDOMARKETING = "endomarketing",
    AMORTIZACAO = "amortizacao",
    RATEIO = "rateio",
    PROVISAO = "provisao",
    OUTROS = "outros"
}
export declare class CreateDespesaDto {
    projectId: string;
    tipo: TipoDespesa;
    descricao: string;
    valor: number;
    mes: number;
    ano: number;
}
export declare class UpdateDespesaDto {
    tipo?: TipoDespesa;
    descricao?: string;
    valor?: number;
    mes?: number;
    ano?: number;
}
export declare class FilterDespesaDto {
    projectId?: string;
    tipo?: TipoDespesa;
    mes?: number;
    ano?: number;
}
//# sourceMappingURL=despesa.dto.d.ts.map