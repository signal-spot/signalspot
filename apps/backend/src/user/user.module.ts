import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { UserController } from './user.controller';
import { BlockService } from './services/block.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, BlockedUser]),
  ],
  controllers: [UserController],
  providers: [BlockService],
  exports: [BlockService],
})
export class UserModule {}