import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./message.entity";
import { Repository } from "typeorm";
import { CreateMessageDto } from "./entities/create-message.dto";

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) { }

  async create(dto: CreateMessageDto, chatId: string, agentId: string) {
    const message = this.repo.create({
      ...dto,
      chat: { id: chatId },
      agent: { id: agentId },
      contact: { id: dto.contactId },
    });

    return this.repo.save(message);
  }

  async findChatMessages(chatId: string) {
    return this.repo.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'DESC' },
      loadRelationIds: true,
    });
  }
}