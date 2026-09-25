import { MessageSenderType } from '@modules/message/message.enum';
import { MessageContent } from '@integrations/whatsapp/types/whatsapp.types';
import { MessageType } from '@modules/message/domain/message.types';

export interface ChatMessagePayload {
  room: string;
  content: MessageContent;
  mediaUrl?: string;
  type?: MessageType;
  sender: {
    id: string;
    type: MessageSenderType;
  };
}
