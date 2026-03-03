import { PrismaService } from '../../prisma/prisma.service';
export declare class UnitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
    }[]>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
    } | null>;
    create(data: {
        code: string;
        name: string;
        description?: string;
    }): Promise<{
        name: string;
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
    }>;
    update(id: string, data: {
        code?: string;
        name?: string;
        description?: string;
        ativo?: boolean;
    }): Promise<{
        name: string;
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
    }>;
}
//# sourceMappingURL=units.service.d.ts.map