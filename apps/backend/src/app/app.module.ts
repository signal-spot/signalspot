import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import firebaseConfig from '../config/firebase.config';
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
import { NotificationModule as PushNotificationModule } from '../notification/notification.module';
import { NotificationModule as NotificationsModule } from '../notifications/notification.module';
import { SacredSiteModule } from '../sacred-site/sacred-site.module';
import { ChatModule } from '../chat/chat.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { UserModule } from '../user/user.module';
import { ReportModule } from '../report/report.module';
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
      envFilePath: ['.env.development', '.env.local', '.env'],
      load: [firebaseConfig],
    }),
    MikroOrmModule.forRoot(databaseConfig),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    CacheModule,
    CommonModule,
    AuthModule,
    ProfileModule,
    UploadModule,
    LocationModule,
    SignalSpotModule,
    SparkModule,
    FeedModule,
    PushNotificationModule,
    NotificationsModule,
    SacredSiteModule,
    ChatModule,
    WebSocketModule,
    UserModule,
    ReportModule,
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
