import { Module } from '@nestjs/common';
import { ChatsModule } from './chats/chats.module';
import { CompaniesModule } from './companies/companies.module';
import { ContactsModule } from './contacts/contacts.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

export {
  ChatsModule,
  CompaniesModule,
  ContactsModule,
  MetricsModule,
  NotificationsModule,
  UsersModule,
  WhatsappModule,
};

export const modules = [
  ChatsModule,
  CompaniesModule,
  ContactsModule,
  NotificationsModule,
  UsersModule,
  WhatsappModule,
  MetricsModule
]

@Module({
  imports: modules,
  exports: modules
}) export class CoreModules { }
