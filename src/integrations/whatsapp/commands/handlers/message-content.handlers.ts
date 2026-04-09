import { Injectable } from '@nestjs/common';
import { ContentHandlerPort } from './content-handler.port';
import { ImageContent, MessageContent, MessageContext, TextContent } from '../../types/whatsapp.types';
import { CommandBus } from '@nestjs/cqrs';
import { SaveChatMessageCommand } from '@modules/chats/commands';
import { MessageSenderType, MessageType } from '@modules/message/message.enum';
import { ChatRepository } from '@modules/chats/chat.repository';
import { WhatsAppClient } from '@integrations/whatsapp/clients/whatsapp.client';
import { PinoLogger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessageContentHandlers {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly client: WhatsAppClient,
    private readonly commandBus: CommandBus,
    private readonly logger: PinoLogger,
  ) { }

  private async saveMessage(
    context: MessageContext,
    payload: SaveChatMessageCommand['data']['msg'],
  ): Promise<void> {
    const chat = await this.chatRepository.findOrCreateChatByPhone(context);

    void this.commandBus.execute(
      new SaveChatMessageCommand({
        msg: payload,
        room: chat.id,
        sender: {
          id: chat.client.id,
          type: MessageSenderType.CLIENT
        },
      }),
    );
  }

  private readonly text: ContentHandlerPort<TextContent> = {
    handle: async (content, context, _config) => {
      await this.saveMessage(context, {
        type: MessageType.TEXT,
        content: {
          body: content.text.body,
          preview_url: content.text.preview_url,
        },
      });
    }
  };

  private readonly image: ContentHandlerPort<ImageContent> = {
    handle: async (content: ImageContent, context, config) => {
      if (!config || !content?.image?.id) return;

      this.client.setConfig(config);

      const upload$ = this.client.upload(content.image.id);

      const { imageUrl } = await firstValueFrom(upload$);

      this.logger.debug({ content, imageUrl }, 'Upload image');

      await this.saveMessage(context, {
        type: MessageType.IMAGE,
        mediaUrl: imageUrl,
        content: {
          id: content.image.id,
          link: imageUrl,
          caption: content.image.caption,
        }
      })
    }
  };

  getHandler<K extends MessageContent['type']>(type: K) {
    const handlers: {
      [K in MessageContent['type']]?: ContentHandlerPort<Extract<MessageContent, { type: K }>>;
    } = {
      text: this.text,
      image: this.image,
    };
    return handlers[type] as ContentHandlerPort<Extract<MessageContent, { type: K }>> | undefined;
  }
}