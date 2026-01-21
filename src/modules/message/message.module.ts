import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.services';
import { MessageRepository } from './message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService, MessageRepository],
  exports: [MessageService]
})
export class MessageModule { }
