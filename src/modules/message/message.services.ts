import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MessageRepository } from "./message.repository";
import { ClsService } from "nestjs-cls";
import { CreateMessageDto } from "./entities/create-message.dto";
import { Message, MessageSenderType, MessageStatus, MessageType } from "./message.entity";

@Injectable()
export class MessageService {
  constructor(
    private readonly repo: MessageRepository,
    private readonly cls: ClsService,
  ) { }

  private get userId() {
    const id = this.cls.get('user.id');
    if (!id) throw new UnauthorizedException('User not found in context');
    return id;
  }

  async create(dto: CreateMessageDto, chatId: string) {
    return this.repo.create(dto, chatId, this.userId);
  }

  async getChatMessages(chatId: string) {
    return this.repo.findChatMessages(chatId);
  }

  async createSimpleMessage(
    payload: Pick<Message, 'direction' | 'body' | 'mediaUrl'>,
    contactId: string,
    chatId: string,
  ) {

    return this.create({
      senderType: this.inferSender(payload.direction),
      direction: payload.direction,
      body: payload.body,
      mediaUrl: payload.mediaUrl,
      status: MessageStatus.SENT,
      type: this.inferType(payload.mediaUrl),
      contactId,
    }, chatId);
  }

  private inferType(mediaUrl?: string) {
    return mediaUrl ? MessageType.IMAGE : MessageType.TEXT;
  }

  private inferSender(direction: 'in' | 'out') {
    return direction === 'in' ? MessageSenderType.CLIENT : MessageSenderType.USER;
  }
}