import { WhatsAppConfig } from '@entities';
import { MessageContext } from '../../types/whatsapp.types';

export interface ContentHandlerPort<T> {
  handle(content: T, context: MessageContext, config: WhatsAppConfig | null): Promise<void> | void;
}