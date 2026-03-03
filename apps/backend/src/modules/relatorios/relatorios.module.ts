import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { PermissionService } from '../auth/permissions/permission.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RelatoriosController],
  providers: [RelatoriosService, PermissionService, PermissionsGuard],
})
export class RelatoriosModule {}
