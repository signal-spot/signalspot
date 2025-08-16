import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from '../entities/user.entity';
import { Location } from '../entities/location.entity';
import { SignalSpot } from '../entities/signal-spot.entity';
import { Comment } from '../entities/comment.entity';
import { Spark } from '../spark/entities/spark.entity';
import { LocationHistory } from '../spark/entities/location-history.entity';
import { SacredSite } from '../sacred-site/entities/sacred-site.entity';
import { SiteActivity } from '../sacred-site/entities/site-activity.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { ChatRoom } from '../entities/chat-room.entity';
import { Message } from '../entities/message.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { Report } from '../entities/report.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(__dirname, '../../', envFile);
dotenv.config({ path: envPath });

console.log(`[Database Config] Loading environment: ${nodeEnv} from ${envPath}`);
console.log(`[Database Config] DB_USERNAME: ${process.env.DB_USERNAME}`);
console.log(`[Database Config] DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'undefined'}`);

export const databaseConfig: Options = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_DATABASE || process.env.DB_NAME || 'signalspot',
  entities: [User, Location, SignalSpot, Spark, LocationHistory, SacredSite, SiteActivity, Notification, ChatRoom, Message, Comment, BlockedUser, Report],
  debug: process.env.NODE_ENV !== 'production',
  // Auto-sync schema in development (creates missing tables)
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },
  allowGlobalContext: true,
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
  // 시간대 설정 추가
  timezone: '+09:00',
  forceUtcTimezone: false,
};; 
// PostgreSQL 타임존 설정을 위한 afterConnect 추가
if (!databaseConfig.pool) {
  databaseConfig.pool = {};
}
databaseConfig.pool.afterCreate = (conn: any, done: any) => {
  conn.query("SET TIME ZONE 'Asia/Seoul'", (err: any) => {
    done(err, conn);
  });
};
