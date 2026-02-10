import { Factory } from 'fishery';
import { faker } from '@faker-js/faker/locale/en';
import { Chat, ChatStatus, ChatPriority, ChatChannel } from '@modules/chats/entities/chat.entity';
import { ContactFactory, MessageFactory } from '@factories';
import { DataSource, EntityManager } from 'typeorm';

type ChatTransientParams = {
  manager?: DataSource | EntityManager;
};

export const ChatFactory = Factory.define<Chat, ChatTransientParams>(({
  associations,
  transientParams,
  onCreate
}) => {

  onCreate(chat => {
    const manager = transientParams.manager;

    if (manager) {
      const repo = manager.getRepository(Chat);
      return repo.save(chat)
    }

    return chat;
  })

  const status = faker.helpers.enumValue(ChatStatus);
  const createdAt = faker.date.recent({ days: 30 });

  const chat = new Chat();

  chat.status = status;
  chat.lastMessage = associations.lastMessage;
  chat.priority = faker.helpers.enumValue(ChatPriority);
  chat.channel = faker.helpers.enumValue(ChatChannel);
  chat.endedAt = (status === ChatStatus.CLOSED || status === ChatStatus.ARCHIVED)
    ? faker.date.between({ from: createdAt, to: new Date() })
    : undefined;

  // associations
  chat.client = associations.client ?? ContactFactory.build();
  chat.messages = associations.messages || MessageFactory.buildList(1);

  return chat;
});