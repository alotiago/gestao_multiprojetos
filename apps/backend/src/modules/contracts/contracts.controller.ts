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
  //  CONTRATOS
  // ═══════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Listar contratos (paginado) - US 1.1' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.contractsService.findAllContratos(
      Number(page) || 1,
      Number(limit) || 10,
      status,
    );
  }

  @Get('disponíveis')
  @ApiOperation({ summary: 'Contratos disponíveis para novos projetos' })
  async findDisponíveis() {
    return this.contractsService.findContratosDisponíveis();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de contrato com objetos e linhas - US 1.2' })
  async findById(@Param('id') id: string) {
    return this.contractsService.findContratoById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar contrato - US 1.3' })
  async create(
    @Body()
    data: {
      nomeContrato: string;
      cliente: string;
      numeroContrato: string;
      dataInicio: string;
      dataFim?: string;
      status?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.createContrato(data as any);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar contrato - US 1.4' })
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      nomeContrato?: string;
      cliente?: string;
      numeroContrato?: string;
      dataInicio?: string;
      dataFim?: string;
      status?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.updateContrato(id, data as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar contrato - soft delete' })
  async delete(@Param('id') id: string) {
    return this.contractsService.deleteContrato(id);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clonar contrato com estrutura completa - US 5.1' })
  async clone(
    @Param('id') id: string,
    @Body() data: { novoNome: string; novoNumero: string },
  ) {
    return this.contractsService.cloneContrato(id, data.novoNome, data.novoNumero);
  }

  // ═══════════════════════════════════════════
  //  OBJETOS CONTRATUAIS
  // ═══════════════════════════════════════════

  @Post(':contratoId/objetos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar objeto contratual - US 2.1' })
  async createObjeto(
    @Param('contratoId') contratoId: string,
    @Body()
    data: {
      nome: string;
      descricao: string;
      dataInicio: string;
      dataFim?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.createObjeto({ ...data, contratoId });
  }

  @Put('objetos/:id')
  @ApiOperation({ summary: 'Atualizar objeto contratual - US 2.2' })
  async updateObjeto(
    @Param('id') id: string,
    @Body()
    data: {
      nome?: string;
      descricao?: string;
      dataInicio?: string;
      dataFim?: string;
      observacoes?: string;
    },
  ) {
    return this.contractsService.updateObjeto(id, data);
  }

  @Delete('objetos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar objeto contratual - US 2.3' })
  async deleteObjeto(@Param('id') id: string) {
    return this.contractsService.deleteObjeto(id);
  }

  // ═══════════════════════════════════════════
  //  LINHAS CONTRATUAIS
  // ═══════════════════════════════════════════

  @Post('objetos/:objetoId/linhas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar linha contratual - US 3.1' })
  async createLinha(
    @Param('objetoId') objetoContratualId: string,
    @Body()
    data: {
      descricaoItem: string;
      unidade: string;
      quantidadeAnualEstimada: number;
      valorUnitario: number;
    },
  ) {
    return this.contractsService.createLinha({
      ...data,
      objetoContratualId,
    });
  }

  @Put('linhas/:id')
  @ApiOperation({ summary: 'Atualizar linha contratual - US 3.2' })
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
  @ApiOperation({ summary: 'Desativar linha contratual - US 3.3' })
  async deleteLinha(@Param('id') id: string) {
    return this.contractsService.deleteLinha(id);
  }

  // ═══════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════

  @Get('projetos/:projectId/resumo')
  @ApiOperation({ summary: 'Resumo contratual do projeto' })
  async getProjectSummary(@Param('projectId') projectId: string) {
    return this.contractsService.getProjectContractSummary(projectId);
  }
}
