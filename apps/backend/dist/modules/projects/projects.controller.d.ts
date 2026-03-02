import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { CreateReceitaDto, UpdateReceitaDto } from './dto/receita.dto';
import { BulkImportProjectDto } from './dto/bulk-import-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(filters: FilterProjectDto): Promise<import("./projects.service").PaginatedResult<any>>;
    analisarCarteira(ano?: string, unitId?: string): Promise<import("./projects.service").CarteiraAnalise>;
    findOne(id: string): Promise<any>;
    create(dto: CreateProjectDto, req: any): Promise<any>;
    importarEmLote(dto: BulkImportProjectDto, req: any): Promise<{
        totalProcessado: number;
        sucessos: number;
        erros: number;
        avisos: number;
        detalhes: any[];
    }>;
    update(id: string, dto: UpdateProjectDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
        project: any;
    }>;
    findReceitas(id: string, ano?: string): Promise<any[]>;
    createReceita(id: string, dto: CreateReceitaDto): Promise<any>;
    updateReceita(id: string, receitaId: string, dto: UpdateReceitaDto): Promise<any>;
    calcularFcst(id: string, anoFim?: string): Promise<import("./projects.service").FcstPoint[]>;
    calcularMargens(id: string, ano: string, mes?: string): Promise<import("./projects.service").MargemIndicadores>;
    consolidar(id: string, ano: string): Promise<any[]>;
}
//# sourceMappingURL=projects.controller.d.ts.map