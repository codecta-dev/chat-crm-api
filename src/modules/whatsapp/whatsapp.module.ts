import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookService } from './services/webhook.service';
import { WhatsAppConfigService } from './services/whatsapp-config.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsAppConfigController, WhatsappController, WhatsappWebhookController } from './controllers';
import { WhatsAppConfig } from './entities';
import { WhatsAppMessageFactory } from './factories/whatsapp-message.factory';
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
    ]),
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
  ],
  exports: [
    WebhookService,
    WhatsAppConfigService,
    WhatsappService,
    WhatsappGateway,
    WhatsAppConfigSubscriber,
    WhatsAppApiClient,
  ],
})
export class WhatsappModule { }
