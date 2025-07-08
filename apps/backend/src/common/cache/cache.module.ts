import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CacheService } from './cache.service';
import { UserCacheService } from './user-cache.service';
import { LocationCacheService } from './location-cache.service';
import { User } from '../../entities/user.entity';
import { Location } from '../../entities/location.entity';

@Global()
@Module({
  imports: [
    ConfigModule,
    MikroOrmModule.forFeature([User, Location]),
  ],
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