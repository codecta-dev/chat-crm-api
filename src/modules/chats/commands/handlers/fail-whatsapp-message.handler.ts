import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FailWhatsAppMessageCommand } from "../fail-whatsapp-message.command";
import { ChatGateway } from "../../gateways/chat.gateway";
import { ChatGatewayEvent } from "../../chat.enum";
import { ChatRepository } from "../../chat.repository";

@CommandHandler(FailWhatsAppMessageCommand)
export class FailWhatsAppMessageHandler implements ICommandHandler<FailWhatsAppMessageCommand> {
  constructor(
    private readonly gateway: ChatGateway,
    private readonly repository: ChatRepository,
  ) { }

  async execute(command: FailWhatsAppMessageCommand): Promise<any> {
    const chat = await this.repository.findChatByPhone(command.recipientId);
    if (!chat) return;
    if (await this.gateway.hasSockets(chat.id)) {
      return this.gateway.server
        .to(chat.id)
        .emit(ChatGatewayEvent.ErrorMessage, command.err);
    } else {
      console.log("No socket connected")
    }
  }
}