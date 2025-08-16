import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bull';
import { SparkDetectionService } from './services/spark-detection.service';
import { SparkController } from './spark.controller';
import { WebSocketModule } from '../websocket/websocket.module';
import { Spark } from './entities/spark.entity';
import { Location } from '../entities/location.entity';
import { LocationModule } from '../location/location.module';
import { User } from '../entities/user.entity';
import { ChatRoom } from '../entities/chat-room.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { LocationProcessingConsumer } from './consumers/location-processing.consumer';

@Module({
  imports: [
    MikroOrmModule.forFeature([Spark, Location, User, ChatRoom, BlockedUser]),
    BullModule.registerQueue({
      name: 'location-processing',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    WebSocketModule,
    forwardRef(() => LocationModule),
  ],
  controllers: [SparkController],
  providers: [SparkDetectionService, LocationProcessingConsumer],
  exports: [SparkDetectionService],
})
export class SparkModule {}