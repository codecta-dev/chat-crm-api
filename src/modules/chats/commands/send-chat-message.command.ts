import { SendChatMessageDto } from "../dto/send-chat-message.dto";

export class SendChatMessageCommand {
  constructor(
    public readonly data: SendChatMessageDto,
  ) { }
}