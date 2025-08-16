import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from './src/entities/user.entity';
import { Location } from './src/entities/location.entity';
import { SignalSpot } from './src/entities/signal-spot.entity';
import { Spark } from './src/spark/entities/spark.entity';
import { LocationHistory } from './src/spark/entities/location-history.entity';
import { SacredSite } from './src/sacred-site/entities/sacred-site.entity';
import { SiteActivity } from './src/sacred-site/entities/site-activity.entity';
import { Notification } from './src/notifications/entities/notification.entity';
import { ChatRoom } from './src/entities/chat-room.entity';
import { Message } from './src/entities/message.entity';
import { BlockedUser } from './src/entities/blocked-user.entity';
import { Report } from './src/entities/report.entity';
import { Comment } from './src/entities/comment.entity';
import * as dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';

// Load the appropriate environment file with correct path resolution
const path = require('path');
const envPath = path.resolve(__dirname, envFile);
dotenv.config({ path: envPath });

console.log(`[MikroORM] Loading environment: ${nodeEnv} from ${envPath}`);
console.log(`[MikroORM] DB_USERNAME: ${process.env.DB_USERNAME}`);

export default defineConfig({
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_DATABASE || process.env.DB_NAME || 'signalspot',
  entities: [User, Location, SignalSpot, Spark, LocationHistory, SacredSite, SiteActivity, Notification, ChatRoom, Message, BlockedUser, Report, Comment],
  debug: process.env.NODE_ENV !== 'production',
  // PostgreSQL 타임존 설정
  pool: {
    afterCreate: (conn: any, done: any) => {
      conn.query("SET TIME ZONE 'Asia/Seoul'", (err: any) => {
        done(err, conn);
      });
    }
  },
  timezone: '+09:00',
  migrations: {
    path: './migrations',
    pathTs: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    dropTables: false,
    safe: false,
    emit: 'ts',
  },
  seeder: {
    path: './seeders',
    pathTs: './seeders',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className,
  },
});