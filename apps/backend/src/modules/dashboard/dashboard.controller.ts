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
    @Query('ano', new ParseIntPipe({ optional: false })) ano: number,
  ) {
    return this.dashboardService.getDashboardExecutivo(ano);
  }

  @Get('financeiro')
  @RequirePermissions(Permission.DASHBOARD_FINANCIAL)
  getDashboardFinanceiro(
    @Query('ano', new ParseIntPipe({ optional: false })) ano: number,
    @Query('mes', new ParseIntPipe({ optional: true })) mes?: number,
  ) {
    return this.dashboardService.getDashboardFinanceiro(ano, mes);
  }

  @Get('financeiro/export/csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @RequirePermissions(Permission.DASHBOARD_FINANCIAL)
  exportDashboardFinanceiroCsv(
    @Query('ano', new ParseIntPipe({ optional: false })) ano: number,
    @Query('mes', new ParseIntPipe({ optional: true })) mes?: number,
  ) {
    return this.dashboardService.exportDashboardFinanceiroCsv(ano, mes);
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
