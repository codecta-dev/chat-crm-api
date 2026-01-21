import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { SentimentService } from './services/sentiment.service';
import { WebhookService } from './services/webhook.service';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsappService } from './whatsapp.service';
import { SentimentAnalysis } from './entities/sentiment-analysis.entity';
import { SentimentClient } from './clients/sentiment.client';
import { SentimentController, WhatsAppConfigController, WhatsappController, WhatsappWebhookController } from './controllers';
import { WhatsAppConfig } from './entities';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
import { SentimentGateway } from './gateways/sentiment.gateway';
import { SentimentProcessor } from './processors/sentiment.processor';
import { WhatsAppConfigSubscriber } from './subscribers/whatsapp-config.subscriber';
import { WhatsAppApiClient } from './whatsapp-api.client';
import { WhatsappGateway } from './whatsapp.gateway';
import { ChatsModule } from '../chats/chats.module';
import { ChatsService } from '../chats/chats.service';
import { Chat } from '../chats/entities';
import { ContactsModule } from '../contacts/contacts.module';
import { Contact } from '../contacts/entities/contact.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { Message } from '@modules/message/message.entity';
import { MessageModule } from '@modules/message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      Message,
      Contact,
      User,
      WhatsAppConfig,
      Chat,
      SentimentAnalysis,
    ]),
    BullModule.registerQueue({
      name: 'sentiment'
    }),
    HttpModule,
    NotificationsModule,
    forwardRef(() => ChatsModule),
    ContactsModule,
    UsersModule,
    MessageModule,
  ],
  controllers: [
    WhatsappController,
    WhatsappWebhookController,
    WhatsAppConfigController,
    SentimentController
  ],
  providers: [
    WebhookService,
    WhatsappService,
    WhatsAppConfigService,
    WhatsappGateway,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
    WhatsAppMessageFactory,
    ChatsService,
    SentimentClient,
    SentimentProcessor,
    SentimentGateway,
    SentimentService,
  ],
  exports: [
    WebhookService,
    WhatsAppConfigService,
    WhatsappService,
    WhatsappGateway,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
    BullModule,
    SentimentClient,
    SentimentProcessor,
    SentimentService,
    SentimentGateway,
  ],
})
export class WhatsappModule { }
