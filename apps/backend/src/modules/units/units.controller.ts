import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Units')
@Controller('units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as unidades' })
  async findAll() {
    const units = await this.unitsService.findAll();
    return { data: units };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar unidade por ID' })
  async findById(@Param('id') id: string) {
    return this.unitsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova unidade' })
  async create(@Body() data: { code: string; name: string; description?: string }) {
    return this.unitsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar unidade' })
  async update(@Param('id') id: string, @Body() data: { code?: string; name?: string; description?: string; ativo?: boolean }) {
    return this.unitsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar unidade (soft delete)' })
  async delete(@Param('id') id: string) {
    return this.unitsService.delete(id);
  }
}
