import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { User } from '../entities/user.entity';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AppWebSocketGateway, WebSocketService],
  exports: [AppWebSocketGateway, WebSocketService],
})
export class WebSocketModule {}