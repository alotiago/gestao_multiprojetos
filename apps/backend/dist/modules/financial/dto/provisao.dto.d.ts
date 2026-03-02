export declare enum TipoProvisao {
    DECIMO_TERCEIRO = "13_salario",
    FERIAS = "ferias",
    RESCISAO = "rescisao",
    CONTINGENCIA = "contingencia",
    INSS_PATRONAL = "inss_patronal",
    FGTS = "fgts",
    MULTA_FGTS = "multa_fgts",
    OUTROS = "outros"
}
export declare class CreateProvisaoDto {
    projectId: string;
    tipo: TipoProvisao;
    descricao?: string;
    valor: number;
    mes: number;
    ano: number;
}
export declare class UpdateProvisaoDto {
    tipo?: TipoProvisao;
    descricao?: string;
    valor?: number;
    mes?: number;
    ano?: number;
    ativo?: boolean;
}
export declare class FilterProvisaoDto {
    projectId?: string;
    tipo?: TipoProvisao;
    ano?: number;
}
//# sourceMappingURL=provisao.dto.d.ts.map