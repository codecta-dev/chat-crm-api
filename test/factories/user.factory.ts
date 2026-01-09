import { Factory } from 'fishery';
import { faker } from '@faker-js/faker/locale/en';
import { User } from '@modules/users/entities/user.entity';

export const userFactory: Factory<User> = Factory.define<User>(({ associations }) => {
  const user: User = {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    username: faker.internet.username(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
    avatar: faker.image.avatar(),
    password: 'password',
    status: 'online',
    chats: associations.chats || [],
    notifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    hashPassword: async () => { }, // stub for tests
  };

  return user;
});