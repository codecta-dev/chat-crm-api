import {
  WhatsappNotification as Notification,
  WhatsappNotificationChange as Change,
  WhatsappNotificationContact as Contact,
  WhatsappNotificationMessage as Message,
  WhatsappNotificationMessageType as MessageType,
  WhatsappNotificationTextMessage as TextMessage,
  WhatsappNotificationImageMessage as ImageMessage,
} from "@daweto/whatsapp-api-types";
import { MessageContent, MessageContext, ParsedMessage } from "../types/whatsapp.types";


// --- Handlers ---

type Handler<T extends Message = Message> = (
  msg: T,
  ctx: MessageContext
) => MessageContent | undefined;

const handlers: Partial<Record<MessageType, Handler>> = {
  text: (msg: TextMessage) => ({
    type: 'text',
    text: msg.text?.body ?? '',
  }),
  image: (msg: ImageMessage) => ({
    type: 'image',
    image: msg.image
  })
  // image: (msg: WhatsappNotificationImageMessage | ImageMessage) => ({ type: 'image', url: ... }),
};

// --- Mappers ---

const toContactMap = (contacts: Contact[]): Record<string, Contact> =>
  Object.fromEntries(contacts.map((c): [string, Contact] => [c.wa_id, c]));

const toMessage = (msg: Message, ctx: MessageContext): ParsedMessage | undefined => {
  const handler = handlers[msg.type];
  const content = handler?.(msg, ctx);
  if (!content) return undefined;
  return { context: ctx, content };
};

const toMessages = ({ value }: Change): ParsedMessage[] => {
  const contacts = toContactMap(value.contacts ?? []);
  return (value.messages ?? []).flatMap((msg) => {
    const ctx: MessageContext = {
      phoneNumberId: value.metadata.phone_number_id,
      from: msg.from,
      messageId: msg.id,
      senderName: contacts[msg.from]?.profile?.name,
    };
    const parsed = toMessage(msg, ctx);
    return parsed ? [parsed] : [];
  });
};

export const mapWebhookToMessages = (body: Notification): ParsedMessage[] => {
  if (body?.object !== 'whatsapp_business_account') return [];
  return body.entry
    .flatMap(({ changes }) => changes)
    .filter(({ field }) => field === 'messages')
    .flatMap(toMessages);
};