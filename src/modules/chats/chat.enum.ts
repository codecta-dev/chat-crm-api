export enum ChatStatus {
  OPEN = 'open',
  PENDING = 'pending',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}
export enum ChatPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
export enum ChatChannel {
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  MESSENGER = 'messenger',
  SMS = 'sms',
  EMAIL = 'email'
}

export enum ReasonAssignment {
  TRANSFER = 'transfer',
  ESCALATION = 'escalation',
  MANUAL = 'manual',
  AUTO = 'auto',
}

export enum ChatGatewayEvent {
  Join = 'chat:join',
  Joined = 'chat:joined',
  SendMessage = 'chat:message:send',
  ReceivedMessage = 'chat:message:received',
  UpdateSentimentIndicator = 'chat:sentiment:update'
}
