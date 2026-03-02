import { PrismaService } from '../../prisma/prisma.service';
import { CreateCalendarioDto, UpdateCalendarioDto, FilterCalendarioDto } from './dto/calendario.dto';
import { CreateSindicatoDto, UpdateSindicatoDto, SimulacaoTrabalhistaDto } from './dto/sindicato.dto';
export declare class ConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCalendarios(filters: FilterCalendarioDto): Promise<{
        estado: string | null;
        cidade: string | null;
        id: string;
        data: Date;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        descricao: string;
        diaSemana: number;
        nacional: boolean;
        createdAt: Date;
    }[]>;
    findCalendarioById(id: string): Promise<{
        estado: string | null;
        cidade: string | null;
        id: string;
        data: Date;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        descricao: string;
        diaSemana: number;
        nacional: boolean;
        createdAt: Date;
    }>;
    createCalendario(dto: CreateCalendarioDto): Promise<{
        estado: string | null;
        cidade: string | null;
        id: string;
        data: Date;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        descricao: string;
        diaSemana: number;
        nacional: boolean;
        createdAt: Date;
    }>;
    updateCalendario(id: string, dto: UpdateCalendarioDto): Promise<{
        estado: string | null;
        cidade: string | null;
        id: string;
        data: Date;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        descricao: string;
        diaSemana: number;
        nacional: boolean;
        createdAt: Date;
    }>;
    deleteCalendario(id: string): Promise<{
        estado: string | null;
        cidade: string | null;
        id: string;
        data: Date;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        descricao: string;
        diaSemana: number;
        nacional: boolean;
        createdAt: Date;
    }>;
    /**
     * Calcula horas previstas de trabalho para um estado/mês/ano
     * Horas previstas = dias úteis * 8 (descontando feriados nacionais + estaduais do estado)
     */
    calcularHorasPrevistas(estado: string, mes: number, ano: number): Promise<{
        estado: string;
        mes: number;
        ano: number;
        diasUteis: number;
        horasPrevistas: number;
        feriados: number;
        feriadosDetalhe: {
            data: Date;
            descricao: string;
            tipo: import(".prisma/client").$Enums.FeriadoType;
        }[];
    }>;
    findSindicatos(ativo?: boolean): Promise<{
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
    }[]>;
    findSindicatoById(id: string): Promise<{
        colaboradores: {
            id: string;
            nome: string;
            cargo: string;
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
    createSindicato(dto: CreateSindicatoDto): Promise<{
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
    updateSindicato(id: string, dto: UpdateSindicatoDto): Promise<{
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
    deleteSindicato(id: string): Promise<{
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
    /**
     * Simula custo trabalhista com base nas regras do sindicato
     */
    simularCustoTrabalhista(dto: SimulacaoTrabalhistaDto): Promise<{
        sindicato: {
            id: string;
            nome: string;
            regiao: string;
        };
        mes: number;
        ano: number;
        salarioBase: number;
        percentualDissidio: number;
        salarioComDissidio: number;
        horasExtrasValor: number;
        adicionalNoturnoValor: number;
        salarioBruto: number;
        encargosSociais: number;
        custoTotal: number;
    }>;
    findIndices(tipo?: string, ano?: number): Promise<{
        id: string;
        createdAt: Date;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }[]>;
    createIndice(tipo: string, valor: number, mesReferencia: number, anoReferencia: number): Promise<{
        id: string;
        createdAt: Date;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }>;
}
//# sourceMappingURL=config.service.d.ts.map