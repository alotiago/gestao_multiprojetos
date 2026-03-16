import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, ParseIntPipe, Header } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';
import { DashboardService } from './dashboard.service';
import { CreateStatusReportDto, UpdateStatusReportDto, CreateGoLiveDto, UpdateGoLiveDto } from './dto/cockpit.dto';

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

  // ═══════════════════════════════════════════════════════════
  // COCKPIT DO SÓCIO
  // ═══════════════════════════════════════════════════════════

  @Get('cockpit')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  getCockpit(@Query('ano') ano?: string) {
    const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
    return this.dashboardService.getCockpitData(anoNum);
  }

  // ── Status Reports CRUD ──

  @Get('status-reports')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  getStatusReports(@Query('projectId') projectId?: string) {
    return this.dashboardService.findStatusReports(projectId);
  }

  @Post('status-reports')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  createStatusReport(@Body() dto: CreateStatusReportDto) {
    return this.dashboardService.createStatusReport(dto);
  }

  @Put('status-reports/:id')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  updateStatusReport(@Param('id') id: string, @Body() dto: UpdateStatusReportDto) {
    return this.dashboardService.updateStatusReport(id, dto);
  }

  @Delete('status-reports/:id')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  deleteStatusReport(@Param('id') id: string) {
    return this.dashboardService.deleteStatusReport(id);
  }

  // ── Go-Live CRUD ──

  @Get('go-lives')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  getGoLives(@Query('projectId') projectId?: string) {
    return this.dashboardService.findGoLives(projectId);
  }

  @Post('go-lives')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  createGoLive(@Body() dto: CreateGoLiveDto) {
    return this.dashboardService.createGoLive(dto);
  }

  @Put('go-lives/:id')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  updateGoLive(@Param('id') id: string, @Body() dto: UpdateGoLiveDto) {
    return this.dashboardService.updateGoLive(id, dto);
  }

  @Delete('go-lives/:id')
  @RequirePermissions(Permission.DASHBOARD_EXECUTIVE)
  deleteGoLive(@Param('id') id: string) {
    return this.dashboardService.deleteGoLive(id);
  }
}
