import * as bcrypt from 'bcrypt';

import { User } from "@entities";
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    const { password } = event.entity;
    const hashPassword = await bcrypt.hash(password, 10);

    event.entity.password = hashPassword;
  }
}