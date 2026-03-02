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
            _count: {
                custos: number;
                jornadas: number;
                ferias: number;
            };
            sindicato: {
                nome: string;
                id: string;
                regiao: string;
            } | null;
        } & {
            status: import(".prisma/client").$Enums.UserStatus;
            createdAt: Date;
            nome: string;
            id: string;
            ativo: boolean;
            updatedAt: Date;
            email: string | null;
            estado: string;
            cidade: string;
            matricula: string;
            cargo: string;
            classe: string | null;
            tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
            taxaHora: import("@prisma/client/runtime/library").Decimal;
            cargaHoraria: number;
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
        custos: {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            mes: number;
            ano: number;
            projectId: string;
            colaboradorId: string;
            custoFixo: import("@prisma/client/runtime/library").Decimal;
            custoVariavel: import("@prisma/client/runtime/library").Decimal;
        }[];
        _count: {
            sindicato: number;
            custos: number;
            jornadas: number;
            ferias: number;
            desligamento: number;
        };
        sindicato: {
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
        } | null;
        jornadas: {
            createdAt: Date;
            id: string;
            updatedAt: Date;
            mes: number;
            ano: number;
            projectId: string | null;
            colaboradorId: string;
            horasPrevistas: import("@prisma/client/runtime/library").Decimal;
            horasRealizadas: import("@prisma/client/runtime/library").Decimal;
            fte: import("@prisma/client/runtime/library").Decimal;
        }[];
        ferias: {
            createdAt: Date;
            id: string;
            dataInicio: Date;
            dataFim: Date;
            colaboradorId: string;
            dias: number;
            aprovado: boolean;
        }[];
        desligamento: {
            createdAt: Date;
            id: string;
            observacoes: string | null;
            colaboradorId: string;
            dataDesligamento: Date;
            motivo: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        nome: string;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        email: string | null;
        estado: string;
        cidade: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    create(dto: CreateColaboradorDto): Promise<{
        sindicato: {
            nome: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        nome: string;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        email: string | null;
        estado: string;
        cidade: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    update(id: string, dto: UpdateColaboradorDto): Promise<{
        sindicato: {
            nome: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        nome: string;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        email: string | null;
        estado: string;
        cidade: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    delete(id: string): Promise<{
        status: import(".prisma/client").$Enums.UserStatus;
        createdAt: Date;
        nome: string;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        email: string | null;
        estado: string;
        cidade: string;
        matricula: string;
        cargo: string;
        classe: string | null;
        tipoContratacao: import(".prisma/client").$Enums.TipoContratacao;
        taxaHora: import("@prisma/client/runtime/library").Decimal;
        cargaHoraria: number;
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
        createdAt: Date;
        id: string;
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
        createdAt: Date;
        id: string;
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
        createdAt: Date;
        id: string;
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
        createdAt: Date;
        id: string;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        dias: number;
        aprovado: boolean;
    }[]>;
    createFerias(id: string, dto: CreateFeriasDto): Promise<{
        createdAt: Date;
        id: string;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        dias: number;
        aprovado: boolean;
    }>;
    updateFerias(id: string, feriasId: string, dto: UpdateFeriasDto): Promise<{
        createdAt: Date;
        id: string;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        dias: number;
        aprovado: boolean;
    }>;
    createDesligamento(id: string, dto: CreateDesligamentoDto): Promise<{
        createdAt: Date;
        id: string;
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