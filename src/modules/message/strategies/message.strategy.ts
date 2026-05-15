import { Message } from '@entities';
import { BroadcastDto } from '@modules/chats/dto/broadcast.dto';
import {
  WhatsAppMessageContent,
  WhatsAppPayload,
} from '@integrations/whatsapp/interfaces/whatsapp-message.interface';

export interface MessageStrategy {
  // Send to Whatsapp Business API
  toWhatsAppPayload(
    to: string,
    content: WhatsAppMessageContent,
  ): WhatsAppPayload;

  // Save in db with mapper
  toEntityFields(content: WhatsAppMessageContent): Partial<Message>;

  toBroadcastFields(message: Message): BroadcastDto;
}
