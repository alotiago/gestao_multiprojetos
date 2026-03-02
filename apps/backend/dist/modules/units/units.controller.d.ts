import { UnitsService } from './units.service';
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    findAll(): Promise<{
        data: {
            name: string;
            id: string;
            createdAt: Date;
            ativo: boolean;
            updatedAt: Date;
            description: string | null;
            code: string;
        }[];
    }>;
    findById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        ativo: boolean;
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
        createdAt: Date;
        ativo: boolean;
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
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        description: string | null;
        code: string;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        ativo: boolean;
        updatedAt: Date;
        description: string | null;
        code: string;
    }>;
}
//# sourceMappingURL=units.controller.d.ts.map