import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppService } from './whatsapp.service';
import { WebhookController } from './controllers';
import { WhatsAppConfig } from './entities';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
import { WhatsAppConfigSubscriber } from './subscribers/whatsapp-config.subscriber';
import { WhatsAppApiClient } from './whatsapp-api.client';
import { WhatsappController } from './controllers/whatsapp.controller';
import { WhatsAppMessageDetail } from './entities/whatsapp-message-detail.entity';
import { ReceiveWhatsAppMessageHandler } from './commands/handlers/receive-whatsapp-message.handler';
import { MessageContentHandlers } from './commands/handlers/message-content.handlers';
import { WhatsAppClient } from './clients/whatsapp.client';
import { SendWhatsAppMessageHandler } from './commands/handlers/send-whatsapp-message.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { ChatsModule } from '@modules';

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      WhatsAppConfig,
      WhatsAppMessageDetail,
    ]),
    HttpModule,
    ChatsModule
  ],
  controllers: [
    WebhookController,
    WhatsappController,
  ],
  providers: [
    WhatsAppService,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
    WhatsAppClient,
    WhatsAppMessageFactory,
    ReceiveWhatsAppMessageHandler,
    MessageContentHandlers,
    SendWhatsAppMessageHandler,
  ],
  exports: [
    WhatsAppService,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
  ],
}) export class WhatsappModule { }
