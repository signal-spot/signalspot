import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { LocationModule } from '../location/location.module';
import { SignalSpotModule } from '../signal-spot/signal-spot.module';
import { ProfileModule } from '../profile/profile.module';
import { UploadModule } from '../upload/upload.module';
import { SparkModule } from '../spark/spark.module';
import { FeedModule } from '../feed/feed.module';
import { NotificationModule } from '../notifications/notification.module';
import { SacredSiteModule } from '../sacred-site/sacred-site.module';
import { CacheModule } from '../common/cache/cache.module';
import { CommonModule } from '../common/common.module';
import { databaseConfig } from '../database/database.config';
import { CompressionMiddleware } from '../common/middleware/compression.middleware';
import { PerformanceInterceptor } from '../common/interceptors/performance.interceptor';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MikroOrmModule.forRoot(databaseConfig),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule,
    CommonModule,
    AuthModule,
    ProfileModule,
    UploadModule,
    LocationModule,
    SignalSpotModule,
    SparkModule,
    FeedModule,
    NotificationModule,
    SacredSiteModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompressionMiddleware)
      .forRoutes('*');
  }
}
