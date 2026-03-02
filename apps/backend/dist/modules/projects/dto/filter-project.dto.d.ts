import { ProjectStatus } from '@prisma/client';
export declare class FilterProjectDto {
    status?: ProjectStatus;
    search?: string;
    unitId?: string;
    tipo?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}
//# sourceMappingURL=filter-project.dto.d.ts.map