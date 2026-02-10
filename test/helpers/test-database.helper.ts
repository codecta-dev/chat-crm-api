import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { testDatabaseConfig, testDatabaseSQLiteConfig } from 'src/config/database.config';

export const getTestConfig = (
  entities: any[],
  opts?: TypeOrmModuleOptions
): TypeOrmModuleOptions => ({
  ...testDatabaseConfig,
  entities,
  logging: false,
  ...opts,
} as TypeOrmModuleOptions);

export const getTestSQLiteConfig = (
  entities: any[],
  extraOpts?: TypeOrmModuleOptions,
): TypeOrmModuleOptions => ({
  ...testDatabaseSQLiteConfig,
  entities,
  logging: false,
  ...extraOpts,
} as TypeOrmModuleOptions)