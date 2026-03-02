import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateSindicatoDto, UpdateSindicatoDto, FilterSindicatoDto, AplicarDissidioDto, SimulacaoTrabalhistaDto } from './dto/sindicato.dto';
export declare class SindicatoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        percentualDissidio: Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    })[]>;
    findById(id: string): Promise<{
        colaboradores: {
            id: string;
            matricula: string;
            nome: string;
            cargo: string;
            taxaHora: Decimal;
        }[];
    } & {
        id: string;
        descricao: string | null;
        createdAt: Date;
        nome: string;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: Decimal;
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
        percentualDissidio: Decimal;
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
        percentualDissidio: Decimal;
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
        percentualDissidio: Decimal;
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
    simularImpactoFinanceiro(dto: SimulacaoTrabalhistaDto): Promise<{
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
    relatorioPorRegiao(): Promise<{
        totalSindicatos: number;
        regioes: Record<string, {
            sindicatos: number;
            colaboradores: number;
            mediaDissidio: number;
        }>;
    }>;
}
//# sourceMappingURL=sindicato.service.d.ts.map