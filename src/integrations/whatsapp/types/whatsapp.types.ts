export interface MessageContext {
  phoneNumberId: string;
  from: string;
  messageId: string;
  senderName?: string;
}

export interface TextContent {
  type: 'text';
  text: string;
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

interface DocumentContent {
  type: 'document';
  document?: {
    id: string;
    caption: string;
    filename: string;
    sha256: string;
    mime_type: string;
  };
}

export type MessageContent = TextContent | ImageContent | DocumentContent; // | AudioContent | VideoContent ...

export interface ParsedMessage {
  context: MessageContext;
  content: MessageContent;
}