import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    __dirname + '/../modules/**/*.entity{.ts,.js}',
    __dirname + '/../integrations/**/*.entity{.ts,.js}'
  ],
  migrations: [__dirname + '/../migrations/*.ts'],
  synchronize: process.env.NODE_ENV !== 'production',
  namingStrategy: new SnakeNamingStrategy(),
  // logging: ['query'],
};

export const testDatabaseConfig: TypeOrmModuleOptions = {
  ...databaseConfig,
  database: process.env.DB_DATABASE + '_test',
  synchronize: true,
  dropSchema: true,
  logger: 'formatted-console',
}

export const testDatabaseSQLiteConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: ':memory:',
  synchronize: true,
  dropSchema: true,
  entities: [
    __dirname + '/../modules/**/*.entity{.ts,.js}',
    __dirname + '/../integrations/**/*.entity{.ts,.js}'
  ],
  migrations: [__dirname + '/../migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  logger: 'formatted-console'
}