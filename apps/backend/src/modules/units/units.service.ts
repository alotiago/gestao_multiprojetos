import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.unit.findMany({
      where: { ativo: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.unit.findUnique({
      where: { id },
    });
  }

  async create(data: { code: string; name: string; description?: string }) {
    return this.prisma.unit.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id: string, data: { code?: string; name?: string; description?: string; ativo?: boolean }) {
    return this.prisma.unit.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.unit.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
