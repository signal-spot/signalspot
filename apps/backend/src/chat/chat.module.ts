import { Module, forwardRef } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatRoom, Message } from './entities';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { WebSocketModule } from '../websocket/websocket.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([ChatRoom, Message, User, BlockedUser]),
    forwardRef(() => WebSocketModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}