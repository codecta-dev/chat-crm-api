import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController, MessagesController } from './controllers';
import { Chat, Transfer } from './entities';
import { Contact } from '../contacts/entities/contact.entity';
import { User } from '../users/entities/user.entity';
import { MessageModule } from '@modules/message/message.module';
import { ChatGateway } from './gateways/chat.gateway';
import { SentimentModule } from '@modules/analysis/sentiment/sentiment.module';
import { ChatSaga } from './chat.saga';
import { ChatRepository } from './chat.repository';
import { BullModule } from '@nestjs/bullmq';
import { ChatProcessor } from './chat.processor';
import { CqrsModule } from '@nestjs/cqrs';
import {
  BroadcastChatMessageHandler,
  SaveChatMessageHandler,
  SendChatMessageHandler,
  UpdateSentimentIndicatorHandler,
  FailWhatsAppMessageHandler
} from './commands/handlers';

const TypeOrmFeatureModule = TypeOrmModule.forFeature([Chat, Contact, User, Transfer]);
const handlers = [
  BroadcastChatMessageHandler,
  SaveChatMessageHandler,
  SendChatMessageHandler,
  UpdateSentimentIndicatorHandler,
  FailWhatsAppMessageHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmFeatureModule,
    MessageModule,
    SentimentModule,
    BullModule.registerQueue({
      name: 'chat',
    }),
  ],
  controllers: [ChatsController, MessagesController],
  providers: [
    ChatsService, ChatGateway,
    ChatSaga, ChatRepository,
    ChatProcessor,
    ...handlers
  ],
  exports: [ChatRepository, ChatsService]
})
export class ChatsModule { }
