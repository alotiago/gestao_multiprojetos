import { PrismaService } from '../../prisma/prisma.service';
export declare class RelatoriosService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardContratos(ano: number): Promise<any[]>;
}
//# sourceMappingURL=relatorios.service.d.ts.map