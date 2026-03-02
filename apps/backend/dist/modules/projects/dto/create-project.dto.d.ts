import { ProjectStatus } from '@prisma/client';
export declare class CreateProjectDto {
    codigo: string;
    nome: string;
    cliente: string;
    unitId: string;
    status?: ProjectStatus;
    tipo: string;
    dataInicio: string;
    dataFim?: string;
    descricao?: string;
}
//# sourceMappingURL=create-project.dto.d.ts.map