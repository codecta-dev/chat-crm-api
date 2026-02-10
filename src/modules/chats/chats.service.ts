import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { ChatDto, UpdateChatDto } from './dto/chat.dto';
import { Chat, Transfer } from './entities';
import { Message } from '@modules/message/message.entity';
import { MessageService } from '@modules/message/message.services';
import { ChatStatus } from './entities/chat.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Transfer) private readonly transferRepo: Repository<Transfer>,
    @InjectQueue('sentiment') private readonly sentimentQueue: Queue,
    private readonly messages: MessageService,
    private readonly logger: PinoLogger,
  ) { }

  async assignedUser(id: string, userId: string) {
    const chat = await this.chatRepo.findOne({ where: { id: id }, loadRelationIds: true });
    if (!chat) return false;

    void this.transferRepo.save({
      chat: { id },
      fromAgent: chat.assignedAgent,
      toAgent: { id: userId }
    })

    const result = await this.chatRepo.update({ id }, { assignedAgent: { id: userId } })
    return result.affected === 1;
  }

  async addMessage(
    chatId: string,
    payload: Pick<Message, 'senderType' | 'body' | 'mediaUrl' | 'direction' | 'type'>,
  ): Promise<Message> {
    if (!payload.body?.trim()) {
      throw new BadRequestException('Message body cannot be empty');
    }

    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['assignedAgent', 'contact'],
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const savedMessage = await this.messages.createSimpleMessage(payload, chat.contact.id, chat.id);

    this.logger.debug("Sentiment processor here")
    // Consumer
    await this.sentimentQueue.add('analyze', savedMessage);

    this.updateChatLastMessage(chat.id, savedMessage).catch((error) =>
      this.logger.error('Error updating chat last message', error),
    );

    return savedMessage
  }

  updateLastMessage(chatId: string, messageId: string) {
    return this.chatRepo.update({ id: chatId }, { status: ChatStatus.OPEN, lastMessage: { id: messageId } });
  }

  async findOrCreateByContact(agentId: string, contactId: string, isSystem: boolean = false): Promise<Chat> {
    let chat = await this.chatRepo.findOne({
      where: { contact: { id: contactId } },
      relations: ['assignedAgent', 'contact'],
    });

    if (chat) return chat;

    chat = this.chatRepo.create({
      assignedAgent: { id: agentId },
      contact: { id: contactId },
      status: isSystem ? ChatStatus.PENDING : ChatStatus.OPEN,
    });

    return await this.chatRepo.save(chat);
  }

  async getChats(userID?: string, role?: string) {
    this.logger.debug(`Fetching chats for userID: ${userID} with role: ${role}`);
    const chats = await this.chatRepo.find({
      where: (userID && role !== 'admin') ? { assignedAgent: { id: userID } } : {},
      relations: {
        contact: true,
        lastMessage: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 20,
    })

    return chats;
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
