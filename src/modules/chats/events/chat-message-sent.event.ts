import { ChatMessageDto } from "../dto/chat-message.dto";
import { SendChatMessageDto } from "../dto/send-chat-message.dto";

export class ChatMessageSentEvent {
  constructor(
    public readonly payload: SendChatMessageDto | ChatMessageDto
  ) { }
}