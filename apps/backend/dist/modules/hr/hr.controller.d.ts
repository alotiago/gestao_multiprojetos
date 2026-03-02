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
                custos: number;
                jornadas: number;
                ferias: number;
            };
        } & {
            status: import(".prisma/client").$Enums.UserStatus;
            estado: string;
            cidade: string;
            id: string;
            createdAt: Date;
            matricula: string;
            nome: string;
            email: string | null;
            cargo: string;
            classe: string | null;
            tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
            taxaHora: import("@prisma/client/runtime/library").Decimal;
            cargaHoraria: number;
            sindicatoId: string | null;
            dataAdmissao: Date;
            dataDesligamento: Date | null;
            ativo: boolean;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        sindicato: {
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
        } | null;
        custos: {
            mes: number;
            ano: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            colaboradorId: string;
            custoFixo: import("@prisma/client/runtime/library").Decimal;
            custoVariavel: import("@prisma/client/runtime/library").Decimal;
        }[];
        jornadas: {
            mes: number;
            ano: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            colaboradorId: string;
            horasPrevistas: import("@prisma/client/runtime/library").Decimal;
            horasRealizadas: import("@prisma/client/runtime/library").Decimal;
            fte: import("@prisma/client/runtime/library").Decimal;
        }[];
        ferias: {
            id: string;
            createdAt: Date;
            colaboradorId: string;
            dataInicio: Date;
            dataFim: Date;
            aprovado: boolean;
            dias: number;
        }[];
        desligamento: {
            id: string;
            createdAt: Date;
            dataDesligamento: Date;
            motivo: string;
            colaboradorId: string;
            observacoes: string | null;
        } | null;
        _count: {
            sindicato: number;
            custos: number;
            jornadas: number;
            ferias: number;
            desligamento: number;
        };
    } & {
        status: import(".prisma/client").$Enums.UserStatus;
        estado: string;
        cidade: string;
        id: string;
        createdAt: Date;
        matricula: string;
        nome: string;
        email: string | null;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
        ativo: boolean;
        updatedAt: Date;
    }>;
    create(dto: CreateColaboradorDto): Promise<{
        sindicato: {
            id: string;
            nome: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.UserStatus;
        estado: string;
        cidade: string;
        id: string;
        createdAt: Date;
        matricula: string;
        nome: string;
        email: string | null;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
        ativo: boolean;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateColaboradorDto): Promise<{
        sindicato: {
            id: string;
            nome: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.UserStatus;
        estado: string;
        cidade: string;
        id: string;
        createdAt: Date;
        matricula: string;
        nome: string;
        email: string | null;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
        ativo: boolean;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        estado: string;
        cidade: string;
        id: string;
        createdAt: Date;
        matricula: string;
        nome: string;
        email: string | null;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
        ativo: boolean;
        updatedAt: Date;
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
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: import("@prisma/client/runtime/library").Decimal;
        horasRealizadas: import("@prisma/client/runtime/library").Decimal;
        fte: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    createJornada(id: string, dto: CreateJornadaDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: import("@prisma/client/runtime/library").Decimal;
        horasRealizadas: import("@prisma/client/runtime/library").Decimal;
        fte: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateJornada(id: string, jornadaId: string, dto: UpdateJornadaDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        colaboradorId: string;
        dataInicio: Date;
        dataFim: Date;
        aprovado: boolean;
        dias: number;
    }[]>;
    createFerias(id: string, dto: CreateFeriasDto): Promise<{
        id: string;
        createdAt: Date;
        colaboradorId: string;
        dataInicio: Date;
        dataFim: Date;
        aprovado: boolean;
        dias: number;
    }>;
    updateFerias(id: string, feriasId: string, dto: UpdateFeriasDto): Promise<{
        id: string;
        createdAt: Date;
        colaboradorId: string;
        dataInicio: Date;
        dataFim: Date;
        aprovado: boolean;
        dias: number;
    }>;
    createDesligamento(id: string, dto: CreateDesligamentoDto): Promise<{
        id: string;
        createdAt: Date;
        dataDesligamento: Date;
        motivo: string;
        colaboradorId: string;
        observacoes: string | null;
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