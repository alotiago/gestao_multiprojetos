import { Controller, Get, Query, UseGuards, ParseIntPipe, Header } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('executivo')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  getDashboardExecutivo(
    @Query('ano') ano?: string,
    @Query('projectId') projectId?: string,
  ) {
    const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
    return this.dashboardService.getDashboardExecutivo(anoNum, projectId);
  }

  @Get('financeiro')
  @RequirePermissions(Permission.DASHBOARD_FINANCIAL)
  getDashboardFinanceiro(
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('projectId') projectId?: string,
  ) {
    const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    return this.dashboardService.getDashboardFinanceiro(anoNum, mesNum, projectId);
  }

  @Get('financeiro/export/csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions(Permission.DASHBOARD_FINANCIAL)
  exportDashboardFinanceiroCsv(
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
    @Query('projectId') projectId?: string,
  ) {
    const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    return this.dashboardService.exportDashboardFinanceiroCsv(anoNum, mesNum, projectId);
  }

  @Get('recursos')
  @RequirePermissions(Permission.DASHBOARD_RESOURCES)
  getDashboardRecursos(
    @Query('ano', new ParseIntPipe({ optional: false })) ano: number,
    @Query('mes', new ParseIntPipe({ optional: true })) mes?: number,
  ) {
    return this.dashboardService.getDashboardRecursos(ano, mes);
  }

  @Get('projetos')
  @RequirePermissions(Permission.DASHBOARD_PROJECTS)
  getDashboardProjetos(
    @Query('ano', new ParseIntPipe({ optional: false })) ano: number,
  ) {
    return this.dashboardService.getDashboardProjetos(ano);
  }

  @Get('ano-a-ano')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  getVisaoAnoAno(
    @Query('anoInicio', new ParseIntPipe({ optional: true })) anoInicio?: number,
    @Query('anoFim', new ParseIntPipe({ optional: true })) anoFim?: number,
  ) {
    return this.dashboardService.getVisaoAnoAno(anoInicio ?? 2024, anoFim ?? 2030);
  }
}
