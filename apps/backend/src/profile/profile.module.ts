import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../entities/user.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SignatureConnectionService } from './services/signature-connection.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    UploadModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, SignatureConnectionService],
  exports: [ProfileService, SignatureConnectionService],
})
export class ProfileModule {}