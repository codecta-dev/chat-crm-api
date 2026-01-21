import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController, MessagesController } from './controllers';
import { Chat, Transfer } from './entities';
import { Contact } from '../contacts/entities/contact.entity';
import { User } from '../users/entities/user.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { MessageModule } from '@modules/message/message.module';

const TypeOrmFeatureModule = TypeOrmModule.forFeature([Chat, Contact, User, Transfer]);

@Module({
  imports: [
    TypeOrmFeatureModule,
    forwardRef(() => WhatsappModule),
    MessageModule
  ],
  controllers: [ChatsController, MessagesController],
  providers: [ChatsService],
  exports: [TypeOrmFeatureModule, ChatsService]
})
export class ChatsModule { }
