import { define, faker } from '../core/factory';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
  createdAt: Date;
  profile: {
    avatar: string;
    bio: string;
    timezone: string;
  };
}

export const userFactory = define<User>({
  defaults: () => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'user',
    isActive: true,
    createdAt: faker.date.past({ years: 1 }),
    profile: {
      avatar: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      timezone: faker.location.timeZone(),
    },
  }),
  traits: {
    admin: () => ({
      role: 'admin' as const,
      email: faker.internet.email({ provider: 'company.com' }),
    }),
    inactive: () => ({
      isActive: false,
    }),
    viewer: () => ({
      role: 'viewer' as const,
    }),
    newUser: () => ({
      createdAt: new Date(),
      profile: {
        bio: '',
        avatar: '',
        timezone: 'UTC',
      },
    }),
  },
});
