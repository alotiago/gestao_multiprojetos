import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { Permissions } from '../auth/permissions/permissions.decorator';
import { Permission } from '../auth/permissions/permission.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Relatórios')
@ApiBearerAuth()
@Controller('relatorios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('contratos-dashboard')
  @ApiOperation({ summary: 'Dashboard de Contratos com análise financeira' })
  @Permissions(Permission.DASHBOARD_FINANCIAL)
  getDashboardContratos(@Query('ano') ano?: string) {
    const anoNum = ano ? parseInt(ano, 10) : new Date().getFullYear();
    return this.relatoriosService.getDashboardContratos(anoNum);
  }
}
