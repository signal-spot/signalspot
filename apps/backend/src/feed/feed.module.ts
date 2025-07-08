import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FeedAlgorithmService } from './services/feed-algorithm.service';
import { ContentScoringService } from './services/content-scoring.service';
import { SignalSpot } from '../entities/signal-spot.entity';
import { User } from '../entities/user.entity';
import { Spark } from '../spark/entities/spark.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([SignalSpot, User, Spark])
  ],
  controllers: [FeedController],
  providers: [
    FeedService,
    FeedAlgorithmService,
    ContentScoringService,
  ],
  exports: [FeedService],
})
export class FeedModule {}