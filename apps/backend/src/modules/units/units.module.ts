import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';

@Module({
  imports: [PrismaModule],
  providers: [UnitsService],
  controllers: [UnitsController],
  exports: [UnitsService],
})
export class UnitsModule {}
