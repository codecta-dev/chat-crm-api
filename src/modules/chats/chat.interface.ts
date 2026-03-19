import { MessageSenderType } from "@modules/message/message.enum";
import { MessageContent } from "src/integrations/whatsapp/types/whatsapp.types";

export interface ChatMessagePayload {
  chatId: string,
  content: MessageContent,
  sender: {
    id: string,
    type: MessageSenderType
  }
}