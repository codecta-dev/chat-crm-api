import { MessageSenderType, MessageType } from "@modules/message/message.entity";
import { Command } from "@nestjs/cqrs";

export class CreateMessageCommand extends Command<{
  messageId: string,
}> {
  constructor(
    public readonly chatId: string,
    public readonly sender: { id: string, type: MessageSenderType },
    public readonly content: string,
    public readonly type: MessageType
  ) { super() }
}