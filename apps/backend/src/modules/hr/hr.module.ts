import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }), // 10MB
  ],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
