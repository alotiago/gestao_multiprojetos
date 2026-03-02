import { PrismaService } from '../../prisma/prisma.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';
import { FilterColaboradorDto } from './dto/filter-colaborador.dto';
import { CreateJornadaDto, UpdateJornadaDto, BulkJornadaDto } from './dto/jornada.dto';
import { CreateFeriasDto, UpdateFeriasDto } from './dto/ferias.dto';
import { CreateDesligamentoDto } from './dto/desligamento.dto';
import { Decimal } from '@prisma/client/runtime/library';
export declare class HrService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
            taxaHora: Decimal;
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
            custoFixo: Decimal;
            custoVariavel: Decimal;
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
            percentualDissidio: Decimal;
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
            horasPrevistas: Decimal;
            horasRealizadas: Decimal;
            fte: Decimal;
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
        taxaHora: Decimal;
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
        taxaHora: Decimal;
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
        taxaHora: Decimal;
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
        taxaHora: Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
    }>;
    importarCSV(csvContent: string): Promise<{
        imported: number;
        errors: string[];
    }>;
    findJornadas(colaboradorId: string, ano?: number): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: Decimal;
        horasRealizadas: Decimal;
        fte: Decimal;
    }[]>;
    createJornada(colaboradorId: string, dto: CreateJornadaDto): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: Decimal;
        horasRealizadas: Decimal;
        fte: Decimal;
    }>;
    updateJornada(colaboradorId: string, jornadaId: string, dto: UpdateJornadaDto): Promise<{
        createdAt: Date;
        id: string;
        updatedAt: Date;
        mes: number;
        ano: number;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: Decimal;
        horasRealizadas: Decimal;
        fte: Decimal;
    }>;
    bulkCreateJornadas(dto: BulkJornadaDto): Promise<{
        colaboradorId: string;
        success: boolean;
        error?: string;
    }[]>;
    findFerias(colaboradorId: string): Promise<{
        createdAt: Date;
        id: string;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        dias: number;
        aprovado: boolean;
    }[]>;
    createFerias(colaboradorId: string, dto: CreateFeriasDto): Promise<{
        createdAt: Date;
        id: string;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        dias: number;
        aprovado: boolean;
    }>;
    updateFerias(colaboradorId: string, feriasId: string, dto: UpdateFeriasDto): Promise<{
        createdAt: Date;
        id: string;
        dataInicio: Date;
        dataFim: Date;
        colaboradorId: string;
        dias: number;
        aprovado: boolean;
    }>;
    createDesligamento(colaboradorId: string, dto: CreateDesligamentoDto): Promise<{
        createdAt: Date;
        id: string;
        observacoes: string | null;
        colaboradorId: string;
        dataDesligamento: Date;
        motivo: string;
    }>;
    private calcularFTE;
    calcularCustoIndividual(colaboradorId: string, mes: number, ano: number): Promise<{
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
    calcularCustoEquipe(mes: number, ano: number, projectId?: string): Promise<{
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
    projetarCustosAnuais(colaboradorId: string, ano: number): Promise<{
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
    /**
     * Importa múltiplos colaboradores em lote com validação individual
     */
    importarColaboradoresEmLote(colaboradores: any[], userId: string, descricaoOperacao?: string): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: any[];
    }>;
    /**
     * Atualiza múltiplas jornadas em lote com recálculo de FTE
     */
    atualizarJornadasEmLote(jornadas: any[], motivo: string, userId: string): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: any[];
    }>;
    private _calcularFTE;
}
//# sourceMappingURL=hr.service.d.ts.map