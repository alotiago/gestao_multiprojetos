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
            taxaHora: Decimal;
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
            percentualDissidio: Decimal;
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
            custoFixo: Decimal;
            custoVariavel: Decimal;
        }[];
        jornadas: {
            mes: number;
            ano: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            colaboradorId: string;
            horasPrevistas: Decimal;
            horasRealizadas: Decimal;
            fte: Decimal;
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
        taxaHora: Decimal;
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
        taxaHora: Decimal;
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
        taxaHora: Decimal;
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
        taxaHora: Decimal;
        cargaHoraria: number;
        sindicatoId: string | null;
        dataAdmissao: Date;
        dataDesligamento: Date | null;
        ativo: boolean;
        updatedAt: Date;
    }>;
    importarCSV(csvContent: string): Promise<{
        imported: number;
        errors: string[];
    }>;
    findJornadas(colaboradorId: string, ano?: number): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: Decimal;
        horasRealizadas: Decimal;
        fte: Decimal;
    }[]>;
    createJornada(colaboradorId: string, dto: CreateJornadaDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        colaboradorId: string;
        horasPrevistas: Decimal;
        horasRealizadas: Decimal;
        fte: Decimal;
    }>;
    updateJornada(colaboradorId: string, jornadaId: string, dto: UpdateJornadaDto): Promise<{
        mes: number;
        ano: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        id: string;
        createdAt: Date;
        colaboradorId: string;
        dataInicio: Date;
        dataFim: Date;
        aprovado: boolean;
        dias: number;
    }[]>;
    createFerias(colaboradorId: string, dto: CreateFeriasDto): Promise<{
        id: string;
        createdAt: Date;
        colaboradorId: string;
        dataInicio: Date;
        dataFim: Date;
        aprovado: boolean;
        dias: number;
    }>;
    updateFerias(colaboradorId: string, feriasId: string, dto: UpdateFeriasDto): Promise<{
        id: string;
        createdAt: Date;
        colaboradorId: string;
        dataInicio: Date;
        dataFim: Date;
        aprovado: boolean;
        dias: number;
    }>;
    createDesligamento(colaboradorId: string, dto: CreateDesligamentoDto): Promise<{
        id: string;
        createdAt: Date;
        dataDesligamento: Date;
        motivo: string;
        colaboradorId: string;
        observacoes: string | null;
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