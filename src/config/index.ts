import { Module } from '@nestjs/common';

import { CacheModule } from '@nestjs/cache-manager';
import { cacheConfig } from './cache.config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database.config';

import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './logger.config';

import { I18nModule } from 'nestjs-i18n';
import { i18nConfig } from './i18n.config';

import { BullModule } from '@nestjs/bullmq';
import { bullmqConfig } from './bullmq.config';
import { ClsModule } from 'nestjs-cls';
import { clsConfig } from './cls.config';

const configs = [
  I18nModule.forRoot(i18nConfig),
  LoggerModule.forRoot(loggerConfig),
  TypeOrmModule.forRoot(databaseConfig),
  CacheModule.registerAsync(cacheConfig),
  BullModule.forRoot(bullmqConfig),
  ClsModule.forRoot(clsConfig),
]

@Module({
  imports: configs,
  exports: configs
}) export class AppConfigsModule { }