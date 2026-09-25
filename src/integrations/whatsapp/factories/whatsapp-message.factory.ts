import { Injectable } from "@nestjs/common";
import { WhatsAppImageMessage } from "../interfaces/messages/image";
import { WhatsAppTextMessage } from "../interfaces/messages/text";

@Injectable()
export class WhatsAppMessageFactory {
  text(to: string, body: string, preview_url: boolean = false): WhatsAppTextMessage {
    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        body,
        preview_url
      },
    };
  }

  image(to: string, link: string, caption?: string): WhatsAppImageMessage {
    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "image",
      image: { link, caption },
    };
  }

  template(to: string, name: string, language: string): any {
    const message: any = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name,
        language: { code: language },
      },
    };

    // if (components) {
    // message.template.components = components;
    // }

    return message;
  }
}