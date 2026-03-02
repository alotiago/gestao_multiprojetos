import { CalendarioService } from './calendario.service';
import { CreateCalendarioDto, UpdateCalendarioDto, FilterCalendarioDto, CalculoDiasUteisDto, BulkImportFeriadoDto } from './dto/calendario.dto';
export declare class CalendarioController {
    private readonly calendarioService;
    constructor(calendarioService: CalendarioService);
    findAll(filters: FilterCalendarioDto): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        nacional: boolean;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        nacional: boolean;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
    }>;
    create(dto: CreateCalendarioDto): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        nacional: boolean;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
    }>;
    update(id: string, dto: UpdateCalendarioDto): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        nacional: boolean;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        data: Date;
        descricao: string;
        cidade: string | null;
        estado: string | null;
        nacional: boolean;
        tipoFeriado: import(".prisma/client").$Enums.FeriadoType;
        diaSemana: number;
    }>;
    calcularDiasUteis(dto: CalculoDiasUteisDto): Promise<{
        mes: number;
        ano: number;
        estado: string | null;
        cidade: string | null;
        totalDias: number;
        diasUteis: number;
        feriados: number;
        feriadosEmDiaUtil: number;
        diasUteisLiquidos: number;
        horasUteis: number;
    }>;
    calcularJornadaPorRegiao(estado: string, ano: string, cidade?: string): Promise<{
        estado: string;
        cidade: string | null;
        ano: number;
        mensal: {
            mes: number;
            ano: number;
            estado: string | null;
            cidade: string | null;
            totalDias: number;
            diasUteis: number;
            feriados: number;
            feriadosEmDiaUtil: number;
            diasUteisLiquidos: number;
            horasUteis: number;
        }[];
        totalAnual: {
            diasUteis: number;
            horasUteis: number;
            feriados: number;
        };
    }>;
    importarFeriadosEmLote(dto: BulkImportFeriadoDto): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: {
            indice: number;
            status: string;
            mensagem: string;
            entityId?: string;
        }[];
    }>;
    seedFeriadosNacionais(ano: string): Promise<{
        ano: number;
        totalFeriados: number;
        criados: number;
        existentes: number;
        mensagem: string;
    }>;
}
//# sourceMappingURL=calendario.controller.d.ts.map