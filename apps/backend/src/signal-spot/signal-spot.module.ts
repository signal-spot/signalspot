import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../auth/auth.module';
import { SignalSpot } from '../entities/signal-spot.entity';
import { SignalSpotService } from './signal-spot.service';
import { SignalSpotController } from './signal-spot.controller';
import { SignalSpotScheduler } from './signal-spot.scheduler';
import { SignalSpotRepository, SIGNAL_SPOT_REPOSITORY_TOKEN } from '../repositories/signal-spot.repository';
import { SignalSpotDomainService, SignalSpotEventHandler } from '../domain/signal-spot.domain-service';
import { User } from '../entities/user.entity';
import { Location } from '../entities/location.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([SignalSpot, User, Location]),
    ScheduleModule.forRoot(),
    AuthModule
  ],
  providers: [
    SignalSpotService,
    SignalSpotDomainService,
    SignalSpotEventHandler,
    SignalSpotScheduler,
    {
      provide: SIGNAL_SPOT_REPOSITORY_TOKEN,
      useClass: SignalSpotRepository
    }
  ],
  controllers: [SignalSpotController],
  exports: [
    SignalSpotService,
    SignalSpotDomainService,
    SIGNAL_SPOT_REPOSITORY_TOKEN
  ]
})
export class SignalSpotModule {}