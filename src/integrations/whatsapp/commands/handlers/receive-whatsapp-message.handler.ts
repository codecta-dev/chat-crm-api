import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ReceiveWhatsAppMessageCommand } from "../receive-whatsapp-message.command";
import { PinoLogger } from "nestjs-pino";
import { WhatsAppService } from "../../whatsapp.service";
import { MessageContentHandlers } from "./message-content.handlers";

@CommandHandler(ReceiveWhatsAppMessageCommand)
export class ReceiveWhatsAppMessageHandler implements ICommandHandler<ReceiveWhatsAppMessageCommand> {
  constructor(
    private readonly contentHandlers: MessageContentHandlers,
    private readonly service: WhatsAppService,
    private readonly logger: PinoLogger,
  ) { this.logger.setContext(ReceiveWhatsAppMessageCommand.name) }

  async execute({ message }: ReceiveWhatsAppMessageCommand) {
    const { context, content } = message;

    const config = await this.service.getConfigByPhoneNumberId(context.phoneNumberId);

    if (!config) {
      this.logger.debug('No found config')
      return
    }

    this.logger.debug(config, 'Load whatsapp config')
    await this.contentHandlers
      .getHandler(content.type)
      ?.handle(content, context, config);
  }
}