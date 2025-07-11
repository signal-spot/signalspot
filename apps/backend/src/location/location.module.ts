import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Location } from '../entities/location.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Location, User])],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}