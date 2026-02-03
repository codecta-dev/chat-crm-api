import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { User } from '@modules/users/entities/user.entity';

type UserTransientParams = {
  dataSource?: DataSource;
};

export const UserFactory = Factory.define<User, UserTransientParams>(
  ({ onCreate, sequence, transientParams }) => {
    onCreate(async (user) => {
      if (transientParams.dataSource) {
        const repository = transientParams.dataSource.getRepository(User);
        return await repository.save(user);
      }
      return user;
    });

    const user = new User();
    user.firstName = faker.person.firstName();
    user.lastName = faker.person.lastName();
    user.phoneNumber = faker.phone.number({ style: 'international' });
    user.email = faker.internet.email();
    user.username = `user_${sequence}_${faker.internet.username()}`;
    user.avatar = faker.image.avatar();
    user.password = 'Test1234!'; // Hashead for @BeforeInsert
    user.status = 'offline';
    user.address = faker.location.streetAddress();

    return user;
  }
);