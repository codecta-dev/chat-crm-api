import { WhatsAppMessage } from ".";

export interface WhatsAppImageContent {
  link: string;
  caption?: string;
}

export interface WhatsAppImageMessage extends WhatsAppMessage {
  type: 'image';
  image: WhatsAppImageContent;
}