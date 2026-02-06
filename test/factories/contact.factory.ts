import { Factory } from 'fishery';
import { faker } from '@faker-js/faker/locale/en';
import { Contact } from '@modules/contacts/entities/contact.entity';
import { Company } from '@modules/company/entities/company.entity';

export const ContactFactory = Factory.define<Contact>(({ associations }) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const contact: Contact = {
    id: faker.string.uuid(),
    waId: `${faker.string.uuid()}@c.us`,
    firstNames: firstName,
    lastNames: lastName,
    username: faker.internet.username({ firstName, lastName }),
    profile: faker.image.avatar(),
    phoneNumber: `+51${faker.string.numeric(9)}`, // Formato Perú
    email: faker.internet.email({ firstName, lastName }),
    status: 'new',
    source: 'whatsapp',
    lastInteractionAt: faker.date.recent({ days: 30 }),
    tags: faker.helpers.arrayElements(
      ['vip', 'support', 'sales', 'technical', 'billing'],
      { min: 0, max: 3 }
    ),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    company: associations.company || new Company(),
    chats: associations.chats || [],
    messages: associations.messages || [],
  };

  return contact;
});