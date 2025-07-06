/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Swagger setup
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SignalSpot API')
      .setDescription('API documentation for SignalSpot - Connect through physical spaces')
      .setVersion('2.0')
      .addBearerAuth()
      .addTag('Authentication', 'User authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Spots', 'Signal Spot endpoints')
      .addTag('Sparks', 'Signal Spark endpoints')
      .addTag('Chat', 'Real-time chat endpoints')
      .addTag('Feed', 'Feed and discovery endpoints')
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
  
  // 헬스체크 엔드포인트
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
  
  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 SignalSpot API is running on: http://localhost:${port}/${globalPrefix}`,
  );
  
  if (configService.get('NODE_ENV') !== 'production') {
    Logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
  }
}

bootstrap();
