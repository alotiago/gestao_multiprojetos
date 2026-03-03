import { PrismaService } from '../../prisma/prisma.service';
import { CreateCalendarioDto, UpdateCalendarioDto, FilterCalendarioDto, CalculoDiasUteisDto, BulkImportFeriadoDto } from './dto/calendario.dto';
export declare class CalendarioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters: FilterCalendarioDto): Promise<{
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
    findById(id: string): Promise<{
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
    create(dto: CreateCalendarioDto): Promise<{
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
    update(id: string, dto: UpdateCalendarioDto): Promise<{
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
    delete(id: string): Promise<{
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
    calcularJornadaPorRegiao(estado: string, ano: number, cidade?: string): Promise<{
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
    seedFeriadosNacionais(ano: number): Promise<{
        ano: number;
        totalFeriados: number;
        criados: number;
        existentes: number;
        mensagem: string;
    }>;
}
//# sourceMappingURL=calendario.service.d.ts.map