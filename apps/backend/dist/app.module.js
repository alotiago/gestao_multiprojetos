"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const projects_module_1 = require("./modules/projects/projects.module");
const hr_module_1 = require("./modules/hr/hr.module");
const financial_module_1 = require("./modules/financial/financial.module");
const config_module_1 = require("./modules/config/config.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const operations_module_1 = require("./modules/operations/operations.module");
const calendario_module_1 = require("./modules/calendario/calendario.module");
const sindicato_module_1 = require("./modules/sindicato/sindicato.module");
const units_module_1 = require("./modules/units/units.module");
const contracts_module_1 = require("./modules/contracts/contracts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
            }),
            // Rate limiting global (OWASP A07)
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000, // 1 minuto
                    limit: 200, // 200 req/min por IP (global)
                }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            projects_module_1.ProjectsModule,
            hr_module_1.HrModule,
            financial_module_1.FinancialModule,
            config_module_1.SystemConfigModule,
            dashboard_module_1.DashboardModule,
            operations_module_1.OperationsModule,
            calendario_module_1.CalendarioModule,
            sindicato_module_1.SindicatoModule,
            units_module_1.UnitsModule,
            contracts_module_1.ContractsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map