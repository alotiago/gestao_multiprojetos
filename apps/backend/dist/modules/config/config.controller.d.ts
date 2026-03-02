import { ConfigService } from './config.service';
import { CreateCalendarioDto, UpdateCalendarioDto, FilterCalendarioDto } from './dto/calendario.dto';
import { CreateSindicatoDto, UpdateSindicatoDto, SimulacaoTrabalhistaDto } from './dto/sindicato.dto';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: ConfigService);
    findCalendarios(filters: FilterCalendarioDto): Promise<{
        createdAt: Date;
        id: string;
        descricao: string;
        data: Date;
        estado: string | null;
        cidade: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
        nacional: boolean;
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
        createdAt: Date;
        id: string;
        descricao: string;
        data: Date;
        estado: string | null;
        cidade: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
        nacional: boolean;
    }>;
    createCalendario(dto: CreateCalendarioDto): Promise<{
        createdAt: Date;
        id: string;
        descricao: string;
        data: Date;
        estado: string | null;
        cidade: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
        nacional: boolean;
    }>;
    updateCalendario(id: string, dto: UpdateCalendarioDto): Promise<{
        createdAt: Date;
        id: string;
        descricao: string;
        data: Date;
        estado: string | null;
        cidade: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
        nacional: boolean;
    }>;
    deleteCalendario(id: string): Promise<{
        createdAt: Date;
        id: string;
        descricao: string;
        data: Date;
        estado: string | null;
        cidade: string | null;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
        nacional: boolean;
    }>;
    findSindicatos(ativo?: string): Promise<{
        createdAt: Date;
        nome: string;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }[]>;
    findSindicato(id: string): Promise<{
        colaboradores: {
            nome: string;
            id: string;
            cargo: string;
        }[];
    } & {
        createdAt: Date;
        nome: string;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    createSindicato(dto: CreateSindicatoDto): Promise<{
        createdAt: Date;
        nome: string;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    updateSindicato(id: string, dto: UpdateSindicatoDto): Promise<{
        createdAt: Date;
        nome: string;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
        regiao: string;
        percentualDissidio: import("@prisma/client/runtime/library").Decimal;
        dataDissidio: Date | null;
        regimeTributario: string;
    }>;
    deleteSindicato(id: string): Promise<{
        createdAt: Date;
        nome: string;
        id: string;
        descricao: string | null;
        ativo: boolean;
        updatedAt: Date;
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
        tipo: string;
        createdAt: Date;
        id: string;
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
        tipo: string;
        createdAt: Date;
        id: string;
        valor: import("@prisma/client/runtime/library").Decimal;
        mesReferencia: number;
        anoReferencia: number;
    }>;
}
//# sourceMappingURL=config.controller.d.ts.map