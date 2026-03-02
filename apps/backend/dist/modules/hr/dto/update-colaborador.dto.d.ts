import { UserStatus, TipoContratacao } from '@prisma/client';
export declare class UpdateColaboradorDto {
    nome?: string;
    email?: string;
    cargo?: string;
    classe?: string;
    tipoContratacao?: TipoContratacao;
    taxaHora?: number;
    cargaHoraria?: number;
    cidade?: string;
    estado?: string;
    sindicatoId?: string;
    status?: UserStatus;
}
//# sourceMappingURL=update-colaborador.dto.d.ts.map