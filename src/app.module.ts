import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

// Configurations
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AppConfigsModule } from './config';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Utils
import { IsUniqueConstraint } from './utils/validators';

// Modules
import { AuthModule } from './auth/auth.module';
import { CoreModules } from '@modules';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppConfigsModule,
    AuthModule,
    CoreModules,
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor
    }
  ],
})

export class AppModule { }
