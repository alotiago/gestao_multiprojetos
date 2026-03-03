import { HrService } from './hr.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { FilterColaboradorDto } from './dto/filter-colaborador.dto';
import { CreateJornadaDto, UpdateJornadaDto, BulkJornadaDto } from './dto/jornada.dto';
import { CreateFeriasDto, UpdateFeriasDto } from './dto/ferias.dto';
import { CreateDesligamentoDto } from './dto/desligamento.dto';
import { BulkImportColaboradorDto, BulkUpdateJornadaDto } from './dto/bulk-operations.dto';
export declare class HrController {
    private readonly hrService;
    constructor(hrService: HrService);
    findAll(filters: FilterColaboradorDto): Promise<{
        data: ({
            sindicato: {
                id: string;
                nome: string;
                regiao: string;
            } | null;
            _count: {
                ferias: number;
                custos: number;
                jornadas: number;
            };
        } & {
            email: string | null;
            id: string;
            status: import(".prisma/client").$Enums.UserStatus;
            ativo: boolean;
            createdAt: Date;
            updatedAt: Date;
            nome: string;
            matricula: string;
            cargo: string;
            classe: string | null;
            tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
            taxaHora: import("@prisma/client/runtime/library").Decimal;
            cargaHoraria: number;
            cidade: string;
            estado: string;
            sindicatoId: string | null;
            dataAdmissao: Date;
            dataDesligamento: Date | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        ferias: {
            id: string;
            createdAt: Date;
            dataInicio: Date;
            dataFim: Date;
            colaboradorId: string;
            aprovado: boolean;
            dias: number;
        }[];
        desligamento: {
            id: string;
            createdAt: Date;
            observacoes: string | null;
            colaboradorId: string;
            dataDesligamento: Date;
            motivo: string;
        } | null;
        sindicato: {
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
        } | null;
        _count: {
            sindicato: number;
            custos: number;
            jornadas: number;
            ferias: number;
            desligamento: number;
        };
        custos: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            mes: number;
            ano: number;
            projectId: string;
            colaboradorId: string;
            custoFixo: import("@prisma/client/runtime/library").Decimal;
            custoVariavel: import("@prisma/client/runtime/library").Decimal;
        }[];
        jornadas: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            mes: number;
            ano: number;
            projectId: string | null;
            colaboradorId: string;
            horasPrevistas: import("@prisma/client/runtime/library").Decimal;
            horasRealizadas: import("@prisma/client/runtime/library").Decimal;
            fte: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        email: string | null;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        cidade: string;
        estado: string;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    create(dto: CreateColaboradorDto): Promise<{
        sindicato: {
            id: string;
            nome: string;
        } | null;
    } & {
        email: string | null;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        cidade: string;
        estado: string;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    update(id: string, dto: UpdateColaboradorDto): Promise<{
        sindicato: {
            id: string;
            nome: string;
        } | null;
    } & {
        email: string | null;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        cidade: string;
        estado: string;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    delete(id: string): Promise<{
        email: string | null;
        id: string;
        status: import(".prisma/client").$Enums.UserStatus;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        nome: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        cidade: string;
        estado: string;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    importarEmLote(dto: BulkImportColaboradorDto, req: any): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: any[];
    }>;
    importarCSV(file: Express.Multer.File): Promise<{
        imported: number;
        errors: string[];
    }>;
    findJornadas(id: string, ano?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: import("@prisma/client/runtime/library").Decimal;
        horasRealizadas: import("@prisma/client/runtime/library").Decimal;
        fte: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createJornada(id: string, dto: CreateJornadaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: import("@prisma/client/runtime/library").Decimal;
        horasRealizadas: import("@prisma/client/runtime/library").Decimal;
        fte: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateJornada(id: string, jornadaId: string, dto: UpdateJornadaDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: import("@prisma/client/runtime/library").Decimal;
        horasRealizadas: import("@prisma/client/runtime/library").Decimal;
        fte: import("@prisma/client/runtime/library").Decimal;
    }>;
    bulkJornadas(dto: BulkJornadaDto): Promise<{
        colaboradorId: string;
        success: boolean;
        error?: string;
    }[]>;
    atualizarJornadasEmLote(dto: BulkUpdateJornadaDto, req: any): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: any[];
    }>;
    findFerias(id: string): Promise<{
        id: string;
        createdAt: Date;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        aprovado: boolean;
        dias: number;
    }[]>;
    createFerias(id: string, dto: CreateFeriasDto): Promise<{
        id: string;
        createdAt: Date;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        aprovado: boolean;
        dias: number;
    }>;
    updateFerias(id: string, feriasId: string, dto: UpdateFeriasDto): Promise<{
        id: string;
        createdAt: Date;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        aprovado: boolean;
        dias: number;
    }>;
    createDesligamento(id: string, dto: CreateDesligamentoDto): Promise<{
        id: string;
        createdAt: Date;
        observacoes: string | null;
        colaboradorId: string;
        dataDesligamento: Date;
        motivo: string;
    }>;
    calcularCusto(id: string, mes: number, ano: number): Promise<{
        colaboradorId: string;
        matricula: string;
        nome: string;
        mes: number;
        ano: number;
        taxaHora: number;
        cargaHoraria: number;
        horasPrevistas: number;
        horasRealizadas: number;
        fte: number;
        custoFixo: number;
        custoVariavel: number;
        custoTotal: number;
        encargos: number;
    }>;
    projetarCustos(id: string, ano: number): Promise<{
        colaboradorId: string;
        nome: string;
        ano: number;
        projecoesMensais: {
            colaboradorId: string;
            matricula: string;
            nome: string;
            mes: number;
            ano: number;
            taxaHora: number;
            cargaHoraria: number;
            horasPrevistas: number;
            horasRealizadas: number;
            fte: number;
            custoFixo: number;
            custoVariavel: number;
            custoTotal: number;
            encargos: number;
        }[];
        totalAnual: {
            totalHoras: number;
            totalCusto: number;
            mediaFTE: number;
        };
    }>;
    calcularCustoEquipe(mes: number, ano: number): Promise<{
        mes: number;
        ano: number;
        colaboradores: {
            colaboradorId: string;
            matricula: string;
            nome: string;
            mes: number;
            ano: number;
            taxaHora: number;
            cargaHoraria: number;
            horasPrevistas: number;
            horasRealizadas: number;
            fte: number;
            custoFixo: number;
            custoVariavel: number;
            custoTotal: number;
            encargos: number;
        }[];
        totais: {
            totalFTE: number;
            totalCustoFixo: number;
            totalCustoVariavel: number;
            totalCusto: number;
        };
    }>;
}
//# sourceMappingURL=hr.controller.d.ts.map