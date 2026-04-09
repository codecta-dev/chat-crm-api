export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document',
  // FILE = 'file',
  // AUDIO = 'audio',
  // VIDEO = 'video',
}

export enum MessageSenderType {
  AGENT = 'agent',
  USER = 'user',
  CLIENT = 'client',
  SYSTEM = 'system'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  READ = 'read',
  FAILED = 'failed'
}

export enum MessageDirection {
  IN = 'in',
  OUT = 'out'
}
