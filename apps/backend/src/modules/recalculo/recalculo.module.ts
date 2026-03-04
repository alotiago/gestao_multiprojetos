import { Module } from '@nestjs/common';
import { RecalculoService } from './recalculo.service';
import { RecalculoController } from './recalculo.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinancialModule } from '../financial/financial.module';
import { ProjectsModule } from '../projects/projects.module';
import { HrModule } from '../hr/hr.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, FinancialModule, ProjectsModule, HrModule],
  controllers: [RecalculoController],
  providers: [RecalculoService],
  exports: [RecalculoService],
})
export class RecalculoModule {}
