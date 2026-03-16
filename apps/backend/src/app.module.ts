import { MulterModule } from '@nestjs/platform-express';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { HrModule } from './modules/hr/hr.module';
import { FinancialModule } from './modules/financial/financial.module';
import { SystemConfigModule } from './modules/config/config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OperationsModule } from './modules/operations/operations.module';
import { CalendarioModule } from './modules/calendario/calendario.module';
import { SindicatoModule } from './modules/sindicato/sindicato.module';
import { RecalculoModule } from './modules/recalculo/recalculo.module';
import { UnitsModule } from './modules/units/units.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { RelatoriosModule } from './modules/relatorios/relatorios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    // Rate limiting global (OWASP A07)
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 1 minuto
      limit: 200,   // 200 req/min por IP (global)
    }]),
    PrismaModule,
      MulterModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    HrModule,
    FinancialModule,
    SystemConfigModule,
    DashboardModule,
    OperationsModule,
    CalendarioModule,
    SindicatoModule,
    RecalculoModule,
    UnitsModule,
    ContractsModule,
    RelatoriosModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
