import { UnitsService } from './units.service';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    findAll(): Promise<{
        data: {
            createdAt: Date;
            id: string;
            ativo: boolean;
            updatedAt: Date;
            code: string;
            name: string;
            description: string | null;
        }[];
    }>;
    findById(id: string): Promise<{
        createdAt: Date;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        code: string;
        name: string;
        description: string | null;
    } | null>;
    create(data: {
        code: string;
        name: string;
        description?: string;
    }): Promise<{
        createdAt: Date;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        code: string;
        name: string;
        description: string | null;
    }>;
    update(id: string, data: {
        code?: string;
        name?: string;
        description?: string;
        ativo?: boolean;
    }): Promise<{
        createdAt: Date;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        code: string;
        name: string;
        description: string | null;
    }>;
    delete(id: string): Promise<{
        createdAt: Date;
        id: string;
        ativo: boolean;
        updatedAt: Date;
        code: string;
        name: string;
        description: string | null;
    }>;
}
//# sourceMappingURL=units.controller.d.ts.map