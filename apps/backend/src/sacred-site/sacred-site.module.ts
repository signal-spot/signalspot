import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import { SacredSiteController } from './sacred-site.controller';
import { SacredSiteService } from './sacred-site.service';
import { ClusteringService } from './services/clustering.service';
import { RankingService } from './services/ranking.service';
import { SacredSiteScheduler } from './sacred-site.scheduler';
import { SacredSite } from './entities/sacred-site.entity';
import { SiteActivity } from './entities/site-activity.entity';
import { SignalSpot } from '../entities/signal-spot.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([SacredSite, SiteActivity, SignalSpot, User]),
    ScheduleModule,
  ],
  controllers: [SacredSiteController],
  providers: [
    SacredSiteService,
    ClusteringService,
    RankingService,
    SacredSiteScheduler,
  ],
  exports: [SacredSiteService],
})
export class SacredSiteModule {}