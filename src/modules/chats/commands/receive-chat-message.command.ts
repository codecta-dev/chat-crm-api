import { Command } from "@nestjs/cqrs";
import { WhatsappNotificationStatusStatus } from "../../../integrations/whatsapp/controllers/webhook.controller";

export class ReceiveChatMessageCommand extends Command<{ messageId: string }> {
  constructor(
    public readonly chatId: string,
    public readonly id: string,
    public readonly timestamp: Date,
    public readonly content: object,
    public readonly status: WhatsappNotificationStatusStatus,
  ) { super() }
}