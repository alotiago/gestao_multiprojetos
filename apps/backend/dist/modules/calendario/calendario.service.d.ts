import { PrismaService } from '../../prisma/prisma.service';
import { CreateCalendarioDto, UpdateCalendarioDto, FilterCalendarioDto, CalculoDiasUteisDto, BulkImportFeriadoDto } from './dto/calendario.dto';
export declare class CalendarioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters: FilterCalendarioDto): Promise<{
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
    findById(id: string): Promise<{
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
    create(dto: CreateCalendarioDto): Promise<{
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
    update(id: string, dto: UpdateCalendarioDto): Promise<{
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
    delete(id: string): Promise<{
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