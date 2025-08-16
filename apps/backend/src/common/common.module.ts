import { Module } from '@nestjs/common';
import { LoggerModule } from './modules/logger.module';
import { LoggerService } from './services/logger.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContextController } from './controllers/context.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { PerformanceController } from './controllers/performance.controller';
import { ContextEnhancementService } from './services/context-enhancement.service';
import { AnalyticsService } from './services/analytics.service';
import { PerformanceService } from './services/performance.service';
import { FileUploadService } from './services/file-upload.service';
import { CacheService } from './cache/cache.service';
import { LocationCacheService } from './cache/location-cache.service';
import { UserCacheService } from './cache/user-cache.service';
import { User } from '../entities/user.entity';
import { SignalSpot } from '../entities/signal-spot.entity';
import { Spark } from '../spark/entities/spark.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, SignalSpot, Spark]),
    LoggerModule,
  ],
  controllers: [ContextController, AnalyticsController, PerformanceController],
  providers: [
    ContextEnhancementService,
    AnalyticsService,
    PerformanceService,
    FileUploadService,
    CacheService,
    LocationCacheService,
    UserCacheService,
    LoggerService,
  ],
  exports: [
    ContextEnhancementService,
    AnalyticsService,
    PerformanceService,
    FileUploadService,
    CacheService,
    LocationCacheService,
    UserCacheService,
    LoggerService,
  ],
})
export class CommonModule {}