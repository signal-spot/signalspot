import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { User } from '../entities/user.entity';
import { Location } from '../entities/location.entity';
import { SignalSpot } from '../entities/signal-spot.entity';
import { Spark } from '../spark/entities/spark.entity';
import { LocationHistory } from '../spark/entities/location-history.entity';

export const databaseConfig: Options = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_DATABASE || 'signalspot',
  entities: [User, Location, SignalSpot, Spark, LocationHistory],
  debug: process.env.NODE_ENV !== 'production',
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
}; 