import { UserStatus, TipoContratacao } from '@prisma/client';
export declare class CreateColaboradorDto {
    matricula: string;
    nome: string;
    email?: string;
    cargo: string;
    classe?: string;
    tipoContratacao?: TipoContratacao;
    taxaHora: number;
    cargaHoraria: number;
    cidade: string;
    estado: string;
    sindicatoId?: string;
    status?: UserStatus;
    dataAdmissao: string;
}
//# sourceMappingURL=create-colaborador.dto.d.ts.map