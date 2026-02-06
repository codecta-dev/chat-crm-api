import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { DataSource, EntityManager } from 'typeorm';
import {
  Message,
  MessageSenderType,
  MessageType,
  MessageStatus,
  MessageDirection
} from '@modules/message/message.entity';
import { UserFactory } from './user.factory';
import { ContactFactory } from './contact.factory';

type MessageTransientParams = {
  manager?: DataSource | EntityManager;
};

export const MessageFactory = Factory.define<Message, MessageTransientParams>(
  ({ onCreate, associations, transientParams, params }) => {
    onCreate(async (message) => {
      const manager = transientParams.manager;
      if (manager) {
        const repository = manager.getRepository(Message);
        return await repository.save(message);
      }
      return message;
    });

    const message = new Message();
    message.waMessageId = `wa_${faker.string.uuid()}`;
    message.replyToMessageId = 'fake-' + faker.string.uuid();
    message.senderType = params.senderType ?? MessageSenderType.USER;
    message.body = faker.lorem.sentence();
    message.type = MessageType.TEXT;
    message.mediaUrl = faker.internet.url();
    message.status = MessageStatus.SENT;
    message.direction = MessageDirection.IN;
    message.reactions = null;

    // relations
    message.chat = associations.chat;
    message.contact = associations.contact ?? ContactFactory.build();
    message.agent = associations.agent ?? UserFactory.build();

    return message;
  }
);