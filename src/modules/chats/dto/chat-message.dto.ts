import { MessageSenderType, MessageType } from "@modules/message/message.enum";
import { ChatMessageContent } from "../chat.types";

export class ChatMessageDto {
  room: string; // This is chatId

  sender: {
    id: string,
    type: MessageSenderType,
  }

  msg: {
    type: MessageType;
    mediaUrl?: string;
    content: ChatMessageContent;
  }
}