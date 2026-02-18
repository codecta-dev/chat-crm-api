import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { ChatDto, UpdateChatDto } from './dto/chat.dto';
import { Chat } from './entities';
import { Message } from '@modules/message/message.entity';
import { ChatStatus } from './chat.enum';
import { ChatRepository } from './chat.repository';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    // @InjectRepository(Transfer) private readonly transferRepo: Repository<Transfer>,
    private readonly repo: ChatRepository,
    private readonly logger: PinoLogger,
    private readonly cls: ClsService,
  ) { }

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
    return agents.map(agent => agent.id);
  }

  async assign(chatId: string, agentId: string) {
    return this.repo.assign(chatId, agentId);
  }

  updateLastMessage(chatId: string, messageId: string) {
    return this.chatRepo.update({ id: chatId }, { status: ChatStatus.OPEN, lastMessage: { id: messageId } });
  }

  async list(agentId?: string) {

    const agent = agentId ?? this.cls.get('user.id');
    if (!agent) return {};

    const chats = await this.repo.listChatsAssignments(agent);
    return chats.map((chat) => ({
      id: chat.chatId,
      message: {
        id: chat.messageId,
        content: chat.messageContent,
        datetime: chat.messageCreated,
      },
      client: {
        id: chat.clientId,
        username: chat.clientUsername,
        phone: chat.clientPhone,
      }
    }))
  }

  create(dto: ChatDto) {
    const chat = this.chatRepo.save({
      ...dto,
      client: { id: dto.client_id }
    });

    return chat;
  }

  findAll() {
    return this.chatRepo.find()
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

  private async updateChatLastMessage(
    chatId: string,
    message: Message,
  ): Promise<void> {
    try {
      const chat = await this.chatRepo.findOneOrFail({
        where: { id: chatId },
      });
      chat.lastMessage = message;
      await this.chatRepo.save(chat);
    } catch (error) {
      this.logger.warn(
        `Failed to update last message for chat ${chatId}`,
        error,
      );
    }
  }
}
