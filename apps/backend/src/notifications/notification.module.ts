import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';

import { Notification } from './entities/notification.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Notification, User]),
    ConfigModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationTemplateService,
    NotificationSchedulerService,
  ],
  exports: [
    NotificationService,
    NotificationTemplateService,
    NotificationSchedulerService,
  ],
})
export class NotificationModule {}