import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';
import { UserCacheService } from './user-cache.service';
import { LocationCacheService } from './location-cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    CacheService,
    UserCacheService,
    LocationCacheService,
  ],
  exports: [
    CacheService,
    UserCacheService,
    LocationCacheService,
  ],
})
export class CacheModule {}