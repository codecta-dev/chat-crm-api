import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateSentimentIndicatorCommand as Command } from "../update-sentiment-indicator.command";
import { PinoLogger } from "nestjs-pino";
import { ChatGateway } from "@modules/chats/gateways/chat.gateway";
import { ChatGatewayEvent } from "@modules/chats/chat.enum";

@CommandHandler(Command)
export class UpdateSentimentIndicatorHandler implements ICommandHandler<Command> {
  constructor(
    private readonly logger: PinoLogger,
    private readonly ws: ChatGateway
  ) { this.logger.setContext(UpdateSentimentIndicatorHandler.name) }

  execute(command: Command): Promise<{ chatId: string; }> {
    if (command.chatId) this.ws.server.to(command.chatId).emit(ChatGatewayEvent.UpdateSentimentIndicator)
    this.logger.debug(command.probabilities, 'Update sentiment');

    return new Promise(() => ({ chatId: command.chatId }))
  }
}