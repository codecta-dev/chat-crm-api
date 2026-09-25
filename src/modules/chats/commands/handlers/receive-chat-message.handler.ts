import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ReceiveChatMessageCommand } from "../receive-chat-message.command";
import { ChatGateway } from "@modules/chats/gateways/chat.gateway";
import { ChatGatewayEvent } from "@modules/chats/chat.enum";

@CommandHandler(ReceiveChatMessageCommand)
export class ReceiveChatMessageHandler implements ICommandHandler<ReceiveChatMessageCommand> {
  constructor(private readonly ws: ChatGateway) { }

  async execute(command: ReceiveChatMessageCommand): Promise<{ messageId: string; }> {
    this.ws.server
      .to(command.chatId)
      .emit(ChatGatewayEvent.ReceivedMessage, {
        id: command.id,
        timestamp: command.timestamp,
        content: command.content,
        status: command.status
      });

    return Promise.resolve({ messageId: command.id })
  }

}