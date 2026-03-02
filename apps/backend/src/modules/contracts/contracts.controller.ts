import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contracts')
@Controller('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  // ═══════════════════════════════════════════
  //  OBJETOS CONTRATUAIS
  // ═══════════════════════════════════════════

  @Get('objetos')
  @ApiOperation({ summary: 'Listar objetos contratuais (paginado)' })
  async findAllObjetos(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.contractsService.findAllObjetos(
      Number(page) || 1,
      Number(limit) || 10,
      projectId,
    );
  }

  @Get('objetos/:id')
  @ApiOperation({ summary: 'Buscar objeto contratual por ID (com linhas)' })
  async findObjetoById(@Param('id') id: string) {
    return this.contractsService.findObjetoById(id);
  }

  @Get('projetos/:projectId/objetos')
  @ApiOperation({ summary: 'Listar objetos contratuais de um projeto' })
  async findObjetosByProject(@Param('projectId') projectId: string) {
    return this.contractsService.findObjetosByProject(projectId);
  }

  @Post('objetos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar objeto contratual' })
  async createObjeto(
    @Body()
    data: {
      projectId: string;
      numero: string;
      descricao: string;
      dataInicio: string;
      dataFim?: string;
    },
  ) {
    return this.contractsService.createObjeto(data);
  }

  @Put('objetos/:id')
  @ApiOperation({ summary: 'Atualizar objeto contratual' })
  async updateObjeto(
    @Param('id') id: string,
    @Body() data: { descricao?: string; dataInicio?: string; dataFim?: string },
  ) {
    return this.contractsService.updateObjeto(id, data);
  }

  @Delete('objetos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar objeto contratual (soft delete)' })
  async deleteObjeto(@Param('id') id: string) {
    return this.contractsService.deleteObjeto(id);
  }

  // ═══════════════════════════════════════════
  //  LINHAS CONTRATUAIS
  // ═══════════════════════════════════════════

  @Get('objetos/:objetoId/linhas')
  @ApiOperation({ summary: 'Listar linhas contratuais de um objeto' })
  async findLinhasByObjeto(@Param('objetoId') objetoId: string) {
    return this.contractsService.findLinhasByObjeto(objetoId);
  }

  @Get('linhas/:id')
  @ApiOperation({ summary: 'Buscar linha contratual por ID' })
  async findLinhaById(@Param('id') id: string) {
    return this.contractsService.findLinhaById(id);
  }

  @Get('projetos/:projectId/linhas')
  @ApiOperation({ summary: 'Listar todas as linhas contratuais de um projeto' })
  async findLinhasByProject(@Param('projectId') projectId: string) {
    return this.contractsService.findLinhasByProject(projectId);
  }

  @Post('linhas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar linha contratual' })
  async createLinha(
    @Body()
    data: {
      objetoContratualId: string;
      descricaoItem: string;
      unidade: string;
      quantidadeAnualEstimada: number;
      valorUnitario: number;
    },
  ) {
    return this.contractsService.createLinha(data);
  }

  @Put('linhas/:id')
  @ApiOperation({ summary: 'Atualizar linha contratual (recalcula receitas futuras)' })
  async updateLinha(
    @Param('id') id: string,
    @Body()
    data: {
      descricaoItem?: string;
      unidade?: string;
      quantidadeAnualEstimada?: number;
      valorUnitario?: number;
    },
  ) {
    return this.contractsService.updateLinha(id, data);
  }

  @Delete('linhas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar linha contratual (soft delete)' })
  async deleteLinha(@Param('id') id: string) {
    return this.contractsService.deleteLinha(id);
  }
}
