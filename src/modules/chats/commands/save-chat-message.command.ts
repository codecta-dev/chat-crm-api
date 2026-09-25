import { ChatMessageDto } from "../dto/chat-message.dto";
import { SendChatMessageDto } from "../dto/send-chat-message.dto";

export class SaveChatMessageCommand {
  constructor(
    public readonly data: SendChatMessageDto | ChatMessageDto
  ) { }
}