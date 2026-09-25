import { MessageStrategy } from './message.strategy';
import { Message } from '@entities';
import { WhatsAppTextBuilder } from '@integrations/whatsapp/builders/whatsapp-text.builder';
import {
  WhatsAppPayload,
  WhatsAppTextContent,
} from '@integrations/whatsapp/interfaces/whatsapp-message.interface';
import { BroadcastDto } from '@modules/chats/dto/broadcast.dto';
import { MessageType } from '../domain/message.types';

export class TextMessageStrategy implements MessageStrategy {
  toWhatsAppPayload(to: string, content: WhatsAppTextContent): WhatsAppPayload {
    return new WhatsAppTextBuilder()
      .to(to)
      .body(content.body)
      .previewUrl(content.preview_url)
      .build();
  }

  toEntityFields(content: WhatsAppTextContent): Partial<Message> {
    return {
      type: MessageType.TEXT,
      content: content.body,
    };
  }

  toBroadcastFields(message: Message): BroadcastDto {
    return {
      id: message.id,
      chatId: message.chat?.id,
      timestamp: message.updatedAt,
      status: message.status,
      msg: {
        type: MessageType.TEXT,
        content: {
          body: message.content,
        },
      },
      sender: {
        id: message.senderId,
        type: message.senderType,
      },
    };
  }
}
