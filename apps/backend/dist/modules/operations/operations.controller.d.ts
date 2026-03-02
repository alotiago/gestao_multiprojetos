import { BulkAjusteJornadaDto, BulkAjusteTaxaDto } from './dto/mass-update.dto';
import { RecalculoCascataDto, RecalculoRangeDto } from './dto/recalculo-cascata.dto';
import { OperationsService } from './operations.service';
export declare class OperationsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    ajusteMassivoJornada(dto: BulkAjusteJornadaDto): Promise<{
        success: boolean;
        processados: number;
        historicoId: string;
        message: string;
    }>;
    ajusteMassivoTaxa(dto: BulkAjusteTaxaDto): Promise<{
        success: boolean;
        processados: number;
        historicoId: string;
        message: string;
    }>;
    listarHistorico(projectId?: string, limit?: number): Promise<{
        tipo: string;
        createdAt: Date;
        id: string;
        criadoPor: string | null;
        projectId: string;
        dadosAntes: import("@prisma/client/runtime/library").JsonValue;
        dadosDepois: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    rollbackMassivo(historicoId: string): Promise<{
        success: boolean;
        historicoId: string;
        message: string;
    }>;
    recalculoCascata(dto: RecalculoCascataDto): Promise<{
        success: boolean;
        processados: number;
        historicoId: string;
        mes: number;
        ano: number;
        detalhes: {
            colaboradorId: string;
            matricula: string;
            nome: string;
            diasUteis: number;
            horasPrevistas: number;
            taxaHora: number;
            custoVariavel: number;
            fte: number;
        }[];
        resumo: {
            totalHorasPrevistas: number;
            totalCustoVariavel: number;
            fteMedia: number;
        };
        message: string;
    }>;
    recalculoCascataRange(dto: RecalculoRangeDto): Promise<{
        success: boolean;
        projectId: string;
        ano: number;
        mesInicio: number;
        mesFim: number;
        totalMeses: number;
        resultados: {
            mes: number;
            processados: number;
            historicoId: string;
            resumo: {
                totalHorasPrevistas: number;
                totalCustoVariavel: number;
                fteMedia: number;
            };
        }[];
        message: string;
    }>;
}
//# sourceMappingURL=operations.controller.d.ts.map