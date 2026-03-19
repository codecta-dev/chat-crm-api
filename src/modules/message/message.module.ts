import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.services';
import { MessageRepository } from './message.repository';
import { MessageSubscriber } from './message.subscriber';
import { MessageProcessor } from './message.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'message',
    }),
    TypeOrmModule.forFeature([Message])
  ],
  providers: [
    MessageService,
    MessageRepository,
    MessageSubscriber,
    MessageProcessor,
  ],
  exports: [
    MessageService,
    MessageRepository,
    MessageProcessor
  ]
})
export class MessageModule { }
