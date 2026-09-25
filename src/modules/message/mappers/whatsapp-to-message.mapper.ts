import { MessageContent } from '@integrations/whatsapp/types/whatsapp.types';
import { MessageType } from '../message.enum';

export interface WhatsAppIncomingMessage {
  to: string;
  type: MessageType;
  content: MessageContent;
}
