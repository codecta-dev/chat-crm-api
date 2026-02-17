import { WhatsAppImageMessage } from "./messages/image";
import { WhatsAppTextMessage } from "./messages/text";

export type WhatsAppMessage = WhatsAppTextMessage | WhatsAppImageMessage; // | WhatsAppLocationMessage; // Extendible para otros tipos de mensajes

// Response
export interface WhatsAppSendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: WhatsAppContactResponse[];
  messages: WhatsAppMessageResponse[];
}

export interface WhatsAppContactResponse {
  input: string;   // Número ingresado
  wa_id: string;   // Número normalizado por WhatsApp
}

export interface WhatsAppMessageResponse {
  id: string;      // ID único del mensaje enviado
}
