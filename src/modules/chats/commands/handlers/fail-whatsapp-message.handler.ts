import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FailWhatsAppMessageCommand } from "../fail-whatsapp-message.command";
import { ChatGateway } from "@modules/chats/gateways/chat.gateway";
import { ChatGatewayEvent } from "@modules/chats/chat.enum";

@CommandHandler(FailWhatsAppMessageCommand)
export class FailWhatsAppMessageHandler implements ICommandHandler<FailWhatsAppMessageCommand> {
  constructor(
    private readonly gateway: ChatGateway,
  ) { }

  execute(command: FailWhatsAppMessageCommand): any {
    return this.gateway.server.emit(ChatGatewayEvent.ErrorMessage, command.err);
  }
}