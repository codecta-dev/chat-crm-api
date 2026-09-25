import { Chat, Message } from "@entities";
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";

@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this)
  }

  listenTo() {
    return Message;
  }

  afterInsert(event: InsertEvent<Message>) {
    const chat = event.entity?.chat;

    if (chat) {
      void event.manager.update(Chat, chat.id, {
        lastMessage: event.entity,
        lastMessageAt: event.entity.createdAt
      });
    }
  }
}