import { Factory } from 'fishery';
import { faker } from '@faker-js/faker/locale/en';
import { Chat, ChatStatus, ChatPriority, ChatChannel } from '@modules/chats/entities/chat.entity';
import { ContactFactory } from './contact.factory';
import { UserFactory } from './user.factory';

export const ChatFactory = Factory.define<Chat>(({ associations }) => {
  const statuses: ChatStatus[] = ['open', 'pending', 'closed', 'archived'];
  const priorities: ChatPriority[] = ['low', 'medium', 'high', 'urgent'];
  const channels: ChatChannel[] = ['whatsapp', 'telegram', 'messenger', 'sms', 'email'];

  const status = faker.helpers.arrayElement(statuses);
  const createdAt = faker.date.recent({ days: 30 });

  const chat: Chat = {
    id: faker.string.uuid(),
    status: status,
    lastMessage: associations.lastMessage || undefined,
    priority: faker.helpers.arrayElement(priorities),
    channel: faker.helpers.arrayElement(channels),
    endedAt: (status === 'closed' || status === 'archived')
      ? faker.date.between({ from: createdAt, to: new Date() })
      : undefined,
    createdAt: createdAt,
    updatedAt: new Date(),
    deletedAt: undefined,
    contact: associations.contact || ContactFactory.build(),
    assignedAgent: associations.assignedAgent || UserFactory.build(),
    messages: associations.messages || [],
  };

  return chat;
});