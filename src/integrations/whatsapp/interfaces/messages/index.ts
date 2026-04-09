export type WhatsAppMessageType = 'text' | 'image' | 'location';

export interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: WhatsAppMessageType;
}