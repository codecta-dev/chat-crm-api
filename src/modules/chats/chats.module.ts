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
import { CreateMessageHandler } from './commands/handlers/create-message.handler';
import { ChatSaga } from './chat.saga';
import { UpdateSentimentIndicatorHandler } from './commands/handlers/update-sentiment-indicator.handler';
import { ChatRepository } from './chat.repository';

const TypeOrmFeatureModule = TypeOrmModule.forFeature([Chat, Contact, User, Transfer]);

@Module({
  imports: [
    TypeOrmFeatureModule,
    MessageModule,
    SentimentModule
  ],
  controllers: [ChatsController, MessagesController],
  providers: [
    ChatsService, ChatGateway,
    ChatSaga, ChatRepository,
    CreateMessageHandler,
    UpdateSentimentIndicatorHandler,
  ],
  exports: [TypeOrmFeatureModule, ChatsService]
})
export class ChatsModule { }
