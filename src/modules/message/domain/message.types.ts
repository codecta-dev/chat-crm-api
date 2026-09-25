import { MessageDirection, MessageSenderType, MessageStatus } from "../message.enum";

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export interface CanonicalContent {
  body?: string;   // texto plano o caption
  mediaUrl?: string;   // url local (servidor) o link externo
  filename?: string;   // solo para documentos
}

export interface CanonicalMessage {
  chatId: string;
  type: MessageType;
  direction: MessageDirection;
  senderType: MessageSenderType;
  senderId?: string;
  content: CanonicalContent;
  externalId?: string;      // ID que asigna WhatsApp
  status: MessageStatus;
}