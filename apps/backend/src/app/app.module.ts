import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { LocationModule } from '../location/location.module';
import { SignalSpotModule } from '../signal-spot/signal-spot.module';
import { databaseConfig } from '../database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MikroOrmModule.forRoot(databaseConfig),
    AuthModule,
    LocationModule,
    SignalSpotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
