import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './entities/create-message.dto';
import { Message } from './message.entity';
import { MessageSenderType, MessageStatus, MessageType } from './message.enum';
import { MessageContent } from '@integrations/whatsapp/types/whatsapp.types';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MessageService {
  constructor(
    private readonly repo: MessageRepository,
    private readonly logger: PinoLogger,
  ) {}

  saveMsg(
    chatId: string,
    msg: MessageContent,
    sender: { id: string; type: MessageSenderType },
  ) {
    if (msg.type === 'text') {
      const message = this.repo.createFromChat(
        chatId,
        msg.text.body,
        sender.id,
        sender.type,
        MessageType.TEXT,
      );
      return message;
    } else {
      this.logger.warn(msg, 'Only text support');
    }
  }

  async create(dto: CreateMessageDto, chatId: string) {
    return this.repo.create(dto, chatId);
  }

  async getChatMessages(chatId: string) {
    return this.repo.findChatMessages(chatId);
  }

  async createSimpleMessage(
    payload: Pick<Message, 'direction' | 'content' | 'mediaUrl'>,
    contactId: string,
    chatId: string,
  ) {
    return this.create(
      {
        senderType: this.inferSender(payload.direction),
        direction: payload.direction,
        body: payload.content,
        mediaUrl: payload.mediaUrl,
        status: MessageStatus.SENT,
        type: this.inferType(payload.mediaUrl),
        contactId,
      },
      chatId,
    );
  }

  private inferType(mediaUrl?: string) {
    return mediaUrl ? MessageType.IMAGE : MessageType.TEXT;
  }

  private inferSender(direction: 'in' | 'out') {
    return direction === 'in'
      ? MessageSenderType.CLIENT
      : MessageSenderType.USER;
  }
}
