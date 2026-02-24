import { WhatsAppTextBuilder } from "./whatsapp-text.builder";

export class WhatsAppMessageBuilder {
  text() {
    return new WhatsAppTextBuilder();
  }
}