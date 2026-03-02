import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Security headers (OWASP A05)
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger documentation - only in development (OWASP A05)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Gestor Multiprojetos API')
      .setDescription('API documentation for PR_SEEC_2026')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`📚 API documentation: http://localhost:${process.env.BACKEND_PORT || 3001}/api/docs`);
  }

  // Health check
  app.getHttpAdapter().get('/health', (_req: unknown, res: any) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
