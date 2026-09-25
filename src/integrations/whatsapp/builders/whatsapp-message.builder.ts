import { MessageContent } from "../types/whatsapp.types";
import { WhatsAppTextBuilder } from "./whatsapp-text.builder";

export class WhatsAppMessageBuilder {
  constructor(
    private readonly to: string,
    private readonly content: MessageContent
  ) { }

  build() {
    switch (this.content.type) {
      case 'text':
        return this.text()
          .to(this.to)
          .body(this.content.text.body)
          .build();
    }
  }

  text() {
    return new WhatsAppTextBuilder();
  }
}