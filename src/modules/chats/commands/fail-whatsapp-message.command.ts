import { WhatsappNotificationError } from "@daweto/whatsapp-api-types";

export class FailWhatsAppMessageCommand {
  constructor(
    public readonly err: WhatsappNotificationError,
  ) { }
}