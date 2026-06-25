import { MessageType } from '@modules/message/domain/message.types';

export interface MessageContext {
  phoneNumberId: string; // Company Phone ID
  from: string;
  messageId: string;
  senderName?: string;
}

export interface TextContent {
  type: 'text';
  text: {
    body: string;
    preview_url?: boolean;
  };
}

export interface ImageContent {
  type: 'image';
  image?: {
    id?: string;
    caption?: string;
    sha256?: string;
    mime_type?: string;
  };
}

export interface DocumentContent {
  type: 'document';
  document?: {
    id: string;
    caption: string;
    filename: string;
    sha256: string;
    mime_type: string;
  };
}

export interface WhatsAppMessageOptions {
  to: string;
  type: MessageType;
  text?: TextContent;
  image?: ImageContent;
  document?: DocumentContent;
}

export type MessageContent = TextContent | ImageContent | DocumentContent; // | AudioContent | VideoContent ...

export interface ParsedMessage {
  context: MessageContext;
  content: MessageContent;
}
