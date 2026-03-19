import { Injectable } from '@nestjs/common';
import { ContentHandlerPort } from './content-handler.port';
import { ImageContent, MessageContent, MessageContext, TextContent } from '../../types/whatsapp.types';
import { CommandBus } from '@nestjs/cqrs';
import { SaveChatMessageCommand } from '@modules/chats/commands';
import { MessageSenderType, MessageType } from '@modules/message/message.enum';
import { ChatRepository } from '@modules/chats/chat.repository';

@Injectable()
export class MessageContentHandlers {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly commandBus: CommandBus,
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
    handle: async (content, context, config) => {
      console.log(content.text.body, ' Config: ', config);

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
    handle: (content: ImageContent, _context, config) => {
      console.log(content.image, ' Config: ', config);
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