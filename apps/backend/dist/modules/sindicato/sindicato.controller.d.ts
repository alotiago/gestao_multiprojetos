import { SindicatoService } from './sindicato.service';
import { CreateSindicatoDto, UpdateSindicatoDto, FilterSindicatoDto, AplicarDissidioDto, SimulacaoTrabalhistaDto } from './dto/sindicato.dto';
export declare class SindicatoController {
    private readonly sindicatoService;
    constructor(sindicatoService: SindicatoService);
    findAll(filters: FilterSindicatoDto): Promise<({
        _count: {
            colaboradores: number;
        };
    } & {
        id: string;
        descricao: string | null;
        createdAt: Date;
        nome: string;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    })[]>;
    relatorioPorRegiao(): Promise<{
        totalSindicatos: number;
        regioes: Record<string, {
            sindicatos: number;
            colaboradores: number;
            mediaDissidio: number;
        }>;
    }>;
    findById(id: string): Promise<{
        colaboradores: {
            id: string;
            matricula: string;
            nome: string;
            cargo: string;
            taxaHora: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        descricao: string | null;
        createdAt: Date;
        nome: string;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    create(dto: CreateSindicatoDto): Promise<{
        id: string;
        descricao: string | null;
        createdAt: Date;
        nome: string;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    update(id: string, dto: UpdateSindicatoDto): Promise<{
        id: string;
        descricao: string | null;
        createdAt: Date;
        nome: string;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        descricao: string | null;
        createdAt: Date;
        nome: string;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    aplicarDissidio(dto: AplicarDissidioDto): Promise<{
        sindicatoId: string;
        totalColaboradores: number;
        percentualReajuste: number;
        mensagem: string;
        detalhes: never[];
        sindicatoNome?: undefined;
        dataBase?: undefined;
    } | {
        sindicatoId: string;
        sindicatoNome: string;
        totalColaboradores: number;
        percentualReajuste: number;
        dataBase: string;
        detalhes: {
            colaboradorId: string;
            matricula: string;
            nome: string;
            taxaAnterior: number;
            taxaNova: number;
        }[];
        mensagem?: undefined;
    }>;
    simularImpacto(dto: SimulacaoTrabalhistaDto): Promise<{
        sindicato: {
            id: string;
            nome: string;
            regiao: string;
            regimeTributario: string;
            percentualDissidio: number;
        };
        simulacao: {
            salarioBase: number;
            salarioComDissidio: number;
            cargaHoraria: number;
            encargos: {
                tipo: string;
                percentual: number;
                valor: number;
            }[];
            totalEncargos: number;
            custoTotalMensal: number;
            custoHora: number;
            custoAnual: number;
            percentualEncargos: number;
        };
    }>;
}
//# sourceMappingURL=sindicato.controller.d.ts.map