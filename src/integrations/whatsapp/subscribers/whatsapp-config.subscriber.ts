import { randomBytes } from "crypto";
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { WhatsAppConfig } from "../entities";

@EventSubscriber()
export class WhatsAppConfigSubscriber implements EntitySubscriberInterface<WhatsAppConfig> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo(): typeof WhatsAppConfig {
    return WhatsAppConfig
  }

  beforeInsert(event: InsertEvent<WhatsAppConfig>): void {
    if (!event.entity.webhookVerifyToken) {
      event.entity.webhookVerifyToken = randomBytes(32).toString('hex');
    }
  }
}