import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppVersionController } from './app-version.controller';
import { AppVersionService } from './app-version.service';
import { AppVersion } from './entities/app-version.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([AppVersion]),
    CommonModule,
  ],
  controllers: [AppVersionController],
  providers: [AppVersionService],
  exports: [AppVersionService],
})
export class AppVersionModule {}