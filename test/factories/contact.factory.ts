import { Factory } from 'fishery';
import { faker } from '@faker-js/faker/locale/en';
import { Contact } from '@modules/contacts/entities/contact.entity';
import { Company } from '@modules/company/entities/company.entity';
import { DataSource, EntityManager } from 'typeorm';

type ContactTransientParams = {
  manager?: DataSource | EntityManager;
};

export const ContactFactory = Factory.define<Contact, ContactTransientParams>(({ associations, onCreate, transientParams }) => {
  onCreate(async (contact) => {
    const manager = transientParams.manager
    if (manager) {
      const repository = manager.getRepository(Contact);
      return await repository.save(contact);
    }

    return contact;
  })
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const contact = new Contact();

  contact.waId = `${faker.string.uuid()}@c.us`;
  contact.firstNames = faker.person.firstName();
  contact.lastNames = firstName;
  contact.username = lastName;
  contact.profile = faker.image.avatar();
  contact.phoneNumber = faker.phone.number({ style: 'international' });
  contact.email = faker.internet.email({ firstName, lastName, provider: 'gmail.com' });
  contact.status = 'new';
  contact.source = 'whatsapp';
  contact.lastInteractionAt = faker.date.recent({ days: 15 });
  contact.tags = faker.helpers.arrayElements(
    ['vip', 'support', 'sales', 'technical', 'billing'],
    { min: 0, max: 3 }
  );
  contact.company = new Company();
  contact.chats = associations.chats || [];
  contact.messages = associations.messages || []

  return contact;
});