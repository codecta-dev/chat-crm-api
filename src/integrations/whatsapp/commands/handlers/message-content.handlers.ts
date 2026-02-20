import { Injectable } from '@nestjs/common';
import { ContentHandlerPort } from './content-handler.port';
import { ImageContent, MessageContent, TextContent } from '../../types/whatsapp.types';

@Injectable()
export class MessageContentHandlers {
  private readonly text: ContentHandlerPort<TextContent> = {
    handle: (content, _context, config) => {
      console.log(content.text, ' Config: ', config);
    },
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