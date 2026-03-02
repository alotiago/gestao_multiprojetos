import { UserStatus } from '@prisma/client';
export declare class FilterColaboradorDto {
    search?: string;
    status?: UserStatus;
    estado?: string;
    cidade?: string;
    cargo?: string;
    sindicatoId?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}
//# sourceMappingURL=filter-colaborador.dto.d.ts.map