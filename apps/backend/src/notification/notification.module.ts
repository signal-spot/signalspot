import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}