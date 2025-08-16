/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  
  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    process.env.FRONTEND_URL || 'http://localhost:8080'
  ];
  
  app.enableCors({
    origin: configService.get('NODE_ENV') === 'production' 
      ? allowedOrigins 
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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
  app.use('/health', async (req, res) => {
    try {
      // 데이터베이스 연결 확인
      const em = app.get('MikroORM').em.fork();
      await em.execute('SELECT 1');
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        environment: configService.get('NODE_ENV'),
        services: {
          database: 'healthy',
          api: 'healthy'
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        environment: configService.get('NODE_ENV'),
        services: {
          database: 'unhealthy',
          api: 'healthy'
        },
        error: error.message
      });
    }
  });
  
  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  Logger.log(
    `🚀 SignalSpot API is running on: http://localhost:${port}/${globalPrefix}`,
  );
  
  if (configService.get('NODE_ENV') !== 'production') {
    Logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
  }
}

bootstrap();
