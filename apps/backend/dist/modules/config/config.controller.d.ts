import { ConfigService } from './config.service';
import { CreateCalendarioDto, UpdateCalendarioDto, FilterCalendarioDto } from './dto/calendario.dto';
import { CreateSindicatoDto, UpdateSindicatoDto, SimulacaoTrabalhistaDto } from './dto/sindicato.dto';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    findCalendarios(filters: FilterCalendarioDto): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        nacional: boolean;
        diaSemana: number;
    }[]>;
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
    findCalendario(id: string): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        nacional: boolean;
        diaSemana: number;
    }>;
    createCalendario(dto: CreateCalendarioDto): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        nacional: boolean;
        diaSemana: number;
    }>;
    updateCalendario(id: string, dto: UpdateCalendarioDto): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        nacional: boolean;
        diaSemana: number;
    }>;
    deleteCalendario(id: string): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        nacional: boolean;
        diaSemana: number;
    }>;
    findSindicatos(ativo?: string): Promise<{
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        descricao: string | null;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }[]>;
    findSindicato(id: string): Promise<{
        colaboradores: {
            id: string;
            nome: string;
            cargo: string;
        }[];
    } & {
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        descricao: string | null;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    createSindicato(dto: CreateSindicatoDto): Promise<{
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        descricao: string | null;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    updateSindicato(id: string, dto: UpdateSindicatoDto): Promise<{
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        descricao: string | null;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    deleteSindicato(id: string): Promise<{
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        descricao: string | null;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    simularCustoTrabalhista(id: string, dto: SimulacaoTrabalhistaDto): Promise<{
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
    createIndice(body: {
        tipo: string;
        valor: number;
        mesReferencia: number;
        anoReferencia: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        tipo: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }>;
}
//# sourceMappingURL=config.controller.d.ts.map