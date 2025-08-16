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
  // 한국 시간대 설정
  process.env.TZ = 'Asia/Seoul';
  
  // Log environment info at startup
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
  
  Logger.log('================================================');
  Logger.log('  SignalSpot Backend Starting');
  Logger.log('================================================');
  Logger.log(`Environment: ${nodeEnv}`);
  Logger.log(`Config File: ${envFile}`);
  Logger.log(`Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE || process.env.DB_NAME || 'signalspot'}`);
  Logger.log(`Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
  Logger.log('================================================');
  
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
      const { MikroORM } = await import('@mikro-orm/core');
      const orm = app.get(MikroORM);
      const em = orm.em.fork();
      await em.getConnection().execute('SELECT 1');
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        environment: configService.get('NODE_ENV'),
        timezone: process.env.TZ,
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
        timezone: process.env.TZ,
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
  
  Logger.log('================================================');
  Logger.log('  SignalSpot Backend Started Successfully');
  Logger.log('================================================');
  Logger.log(`🚀 API URL: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`⚙️  Environment: ${nodeEnv}`);
  Logger.log(`🕐 Timezone: ${process.env.TZ || 'UTC'} (${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })})`);
  
  if (configService.get('NODE_ENV') !== 'production') {
    Logger.log(`📚 API Docs: http://localhost:${port}/docs`);
  }
  
  Logger.log('================================================');
}

bootstrap();
