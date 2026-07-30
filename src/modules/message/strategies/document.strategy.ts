import {
  WhatsAppDocumentContent,
  WhatsAppPayload,
} from '@integrations/whatsapp/interfaces/whatsapp-message.interface';
import { MessageStrategy } from './message.strategy';
import { Message } from '@entities';
import { WhatsAppDocumentBuilder } from '@integrations/whatsapp/builders/whatsapp-document.builder';
import { BroadcastDto } from '@modules/chats/dto/broadcast.dto';
import { MessageType } from '../domain/message.types';

export class DocumentMessageStrategy implements MessageStrategy {
  toWhatsAppPayload(
    to: string,
    content: WhatsAppDocumentContent,
  ): WhatsAppPayload {
    return new WhatsAppDocumentBuilder()
      .to(to)
      .link(content.link)
      .filaname(content.filename)
      .build();
  }

  toEntityFields(
    content: WhatsAppDocumentContent & { mediaUrl?: string },
  ): Partial<Message> {
    return {
      type: MessageType.DOCUMENT,
      mediaUrl: content.link,
      content: content.filename,
    };
  }

  toBroadcastFields(message: Message): BroadcastDto {
    return {
      id: message.id,
      chatId: message.chat?.id,
      timestamp: message.updatedAt,
      status: message.status,
      msg: {
        type: MessageType.DOCUMENT,
        mediaUrl: message.mediaUrl,
        content: {
          filename: message.content,
        },
      },
      sender: {
        id: message.senderId,
        type: message.senderType,
      },
    };
  }
}
