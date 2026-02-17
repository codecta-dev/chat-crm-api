import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookService } from './services/webhook.service';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppConfigController, WhatsappWebhookController } from './controllers';
import { WhatsAppConfig } from './entities';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
import { WhatsAppConfigSubscriber } from './subscribers/whatsapp-config.subscriber';
import { WhatsAppApiClient } from './whatsapp-api.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      WhatsAppConfig,
    ]),
    HttpModule,
  ],
  controllers: [
    WhatsappWebhookController,
    WhatsAppConfigController,
  ],
  providers: [
    WebhookService,
    WhatsappService,
    WhatsAppConfigService,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
    WhatsAppMessageFactory,
  ],
  exports: [
    WebhookService,
    WhatsAppConfigService,
    WhatsappService,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
  ],
})
export class WhatsappModule { }
