import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./message.entity";
import { MessageSenderType, MessageType } from "./message.enum";
import { DataSource, Repository } from "typeorm";
import { CreateMessageDto } from "./entities/create-message.dto";

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateMessageDto, chatId: string) {
    const message = this.repo.create({
      ...dto,
      chat: { id: chatId },
    });

    return this.repo.save(message);
  }

  async createFromChat(
    chatId: string, content: string, senderId: string,
    senderType: MessageSenderType, type: MessageType,
  ) {
    return this.dataSource.transaction((manager) => {
      const message = this.repo.create({
        chat: { id: chatId },
        content,
        senderId,
        senderType,
        type
      });

      return manager.save(message);
    })
  }

  async findChatMessages(chatId: string) {
    return this.repo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'DESC' },
      loadRelationIds: true,
    });
  }
}