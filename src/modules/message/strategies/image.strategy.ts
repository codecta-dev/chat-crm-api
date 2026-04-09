import { WhatsAppMediaContent, WhatsAppPayload } from "@integrations/whatsapp/interfaces/whatsapp-message.interface";
import { MessageStrategy } from "./message.strategy";
import { Message } from "@entities";
import { WhatsAppImageBuilder } from "@integrations/whatsapp/builders/whatsapp-image.builder";
import { WhatsAppImageContent } from "@integrations/whatsapp/interfaces/messages/image";
import { BroadcastDto } from "@modules/chats/dto/broadcast.dto";
import { MessageType } from "../domain/message.types";

export class ImageMessageStrategy implements MessageStrategy {
  toWhatsAppPayload(to: string, content: WhatsAppMediaContent): WhatsAppPayload {
    return new WhatsAppImageBuilder()
      .to(to)
      .link(content.link)
      .caption(content.caption)
      .build()
  }

  toEntityFields(content: WhatsAppImageContent): Partial<Message> {
    return {
      type: MessageType.IMAGE,
      mediaUrl: content.link,
      content: content.caption
    }
  }

  toBroadcastFields(message: Message): BroadcastDto {
    return {
      id: message.id,
      timestamp: message.updatedAt,
      status: message.status,
      msg: {
        type: MessageType.IMAGE,
        mediaUrl: message.mediaUrl,
        content: {
          caption: message.content
        }
      },
      sender: {
        id: message.senderId,
        type: message.senderType,
      },
    }
  }
}