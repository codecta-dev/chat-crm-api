import { Module } from '@nestjs/common';
import { ChatsModule } from './chats/chats.module';
import { CompanyModule } from './company/company.module';
import { ContactsModule } from './contacts/contacts.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AnalysisModule } from './analysis/analysis.module';
import { MessageModule } from './message/message.module';

export {
  ChatsModule,
  CompanyModule,
  ContactsModule,
  MetricsModule,
  NotificationsModule,
  UsersModule,
  WhatsappModule,
  AnalysisModule,
  MessageModule,
};

export const modules = [
  ChatsModule,
  CompanyModule,
  ContactsModule,
  NotificationsModule,
  UsersModule,
  WhatsappModule,
  MetricsModule,
  AnalysisModule,
  MessageModule,
]

@Module({
  imports: modules,
  exports: modules
}) export class CoreModules { }
