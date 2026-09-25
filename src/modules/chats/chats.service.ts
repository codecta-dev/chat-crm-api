import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { DataSource, Repository } from 'typeorm';
import { ChatDto, UpdateChatDto } from './dto/chat.dto';
import { Chat } from './entities';
import { ChatStatus } from './chat.enum';
import { ChatRepository } from './chat.repository';
import { ClsService } from 'nestjs-cls';
import { Message } from '@entities';
import { MessageSenderType } from '@modules/message/message.enum';
import { ChatMessageContent } from './chat.types';
import { getMessageStrategy } from '@modules/message/strategies/strategy.registry';
import { MessageType } from '@modules/message/domain/message.types';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    private readonly dataSource: DataSource,
    private readonly repo: ChatRepository,
    private readonly logger: PinoLogger,
    private readonly cls: ClsService,
  ) {}

  saveMsg(
    chatId: string,
    msg: {
      type: MessageType;
      content: ChatMessageContent & { medialUrl?: string };
    },
    sender: {
      id: string;
      type: MessageSenderType;
    },
  ) {
    const repo = this.dataSource.getRepository(Message);
    this.logger.debug(msg, 'Save message with content');
    const fields = getMessageStrategy(msg.type).toEntityFields(msg.content);

    this.logger.debug(fields, 'Save message with fields');

    const message = repo.create({
      ...fields,
      senderId: sender.id,
      senderType: sender.type,
      chat: { id: chatId },
    });

    return repo.save(message);
  }

  /**
   * Retrieves the identifiers of agents assigned to a specific chat.
   *
   * @param chatId - Unique identifier of the chat (from the Chat entity).
   * @returns Promise resolving to an array of agent IDs associated with the chat.
   *
   * @example
   * const agentIds = await getAssigments("chat-123");
   * // agentIds => ["agent-1", "agent-2", "agent-3"]
   *
   */
  async getAssigments(chatId: string) {
    const agents = await this.repo.findAssigments(chatId);
    return agents.map((agent) => agent.id);
  }

  async assign(chatId: string, agentId: string) {
    return this.repo.assign(chatId, agentId);
  }

  updateLastMessage(chatId: string, messageId: string) {
    return this.chatRepo.update(
      { id: chatId },
      { status: ChatStatus.OPEN, lastMessage: { id: messageId } },
    );
  }

  async list(agentId?: string) {
    const agent = agentId ?? this.cls.get('user.id');
    if (!agent) return {};

    const chats = await this.repo.listChatsAssignments(agent);
    return chats.map((chat) => ({
      id: chat.chatId,
      preview: {
        content: chat.messageContent,
        datetime: chat.messageCreated,
      },
      client: {
        id: chat.clientId,
        username: chat.clientUsername,
        profile: chat.clientProfile,
        phone: chat.clientPhone,
      },
      status: chat.chatStatus,
      createdAt: chat.messageCreated,
    }));
  }

  create(dto: ChatDto) {
    const chat = this.chatRepo.save({
      ...dto,
      client: { id: dto.client_id },
    });

    return chat;
  }

  findAll() {
    return this.chatRepo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, _dto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
