import { WhatsAppMessage } from ".";

export interface WhatsAppTextContent {
  preview_url: boolean;
  body: string;
}

export interface WhatsAppTextMessage extends WhatsAppMessage {
  type: 'text';
  text: WhatsAppTextContent;
}