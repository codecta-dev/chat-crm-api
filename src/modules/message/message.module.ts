import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.services';
import { MessageRepository } from './message.repository';
import { MessageSubscriber } from './message.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService, MessageRepository, MessageSubscriber],
  exports: [MessageService, MessageRepository]
})
export class MessageModule { }
