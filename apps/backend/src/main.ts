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
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', 'http://localhost:3001');
  app.enableCors({
    origin: allowedOrigins.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  
  // Start server
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  Logger.log(
    `🚀 SignalSpot API is running on: http://localhost:${port}/${globalPrefix}`,
  );
  
  if (configService.get('NODE_ENV') !== 'production') {
    Logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
  }
}

bootstrap();
