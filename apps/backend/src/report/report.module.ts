import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Report } from '../entities/report.entity';
import { User } from '../entities/user.entity';
import { SignalSpot } from '../entities/signal-spot.entity';
import { Comment } from '../entities/comment.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Report, User, SignalSpot, Comment]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}