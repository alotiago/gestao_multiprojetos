"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    // Security headers (OWASP A05)
    app.use((0, helmet_1.default)());
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    // Swagger documentation - only in development (OWASP A05)
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Gestor Multiprojetos API')
            .setDescription('API documentation for PR_SEEC_2026')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        logger.log(`📚 API documentation: http://localhost:${process.env.BACKEND_PORT || 3001}/api/docs`);
    }
    // Health check
    app.getHttpAdapter().get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
    const port = process.env.BACKEND_PORT || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map