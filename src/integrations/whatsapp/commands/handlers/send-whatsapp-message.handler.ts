import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SendWhatsAppMessageCommand } from "../send-whatsapp-message.command";
import { PinoLogger } from "nestjs-pino";
import { WhatsAppService } from "../../whatsapp.service";

@CommandHandler(SendWhatsAppMessageCommand)
export class SendWhatsAppMessageHandler implements ICommandHandler<SendWhatsAppMessageCommand> {
  constructor(
    private readonly logger: PinoLogger,
    private readonly service: WhatsAppService,
  ) { this.logger.setContext(SendWhatsAppMessageCommand.name) }

  async execute(command: SendWhatsAppMessageCommand): Promise<any> {
    const res = await this.service.sendMessage(command.payload);
    this.logger.debug(res, 'Send WhatsAppMessage');
  }
}