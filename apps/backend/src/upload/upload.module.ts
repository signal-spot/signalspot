import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { FileUploadService } from '../common/services/file-upload.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, FileUploadService],
  exports: [UploadService, FileUploadService],
})
export class UploadModule {}