import { MessageSenderType } from '@modules/message/message.enum';
import { MessageContent } from '@integrations/whatsapp/types/whatsapp.types';

export interface ChatMessagePayload {
  chatId: string;
  content: MessageContent;
  sender: {
    id: string;
    type: MessageSenderType;
  };
}
