import { Module } from '@nestjs/common';
import { SindicatoController } from './sindicato.controller';
import { SindicatoService } from './sindicato.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SindicatoController],
  providers: [SindicatoService],
  exports: [SindicatoService],
})
export class SindicatoModule {}
