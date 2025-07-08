import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SparkDetectionService } from './services/spark-detection.service';
import { Spark } from './entities/spark.entity';
import { LocationHistory } from './entities/location-history.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Spark, LocationHistory, User]),
  ],
  providers: [SparkDetectionService],
  exports: [SparkDetectionService],
})
export class SparkModule {}