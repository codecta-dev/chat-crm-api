import { ParsedMessage } from "../types/whatsapp.types";

export class ReceiveWhatsAppMessageCommand {
  constructor(
    public readonly message: ParsedMessage
  ) { }
}