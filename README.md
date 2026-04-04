# Test Data Factory

[![CI](https://github.com/mustafaautomation/test-data-factory/actions/workflows/ci.yml/badge.svg)](https://github.com/mustafaautomation/test-data-factory/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

Type-safe test data factory library for TypeScript. Build complex, realistic test data with minimal boilerplate. Inspired by FactoryBot (Ruby) and Fishery (TypeScript).

---

## Why

Writing test data by hand is tedious and error-prone:

```typescript
// Without factories — every test needs this
const user = {
  id: '123', email: 'test@example.com', firstName: 'Test',
  lastName: 'User', role: 'user', isActive: true,
  createdAt: new Date(), profile: { avatar: '', bio: '', timezone: 'UTC' }
};
```

With factories:

```typescript
const user = userFactory.build();                           // Full realistic user
const admin = userFactory.buildWith('admin');                // Admin variant
const custom = userFactory.build({ firstName: 'Alice' });   // Override what you need
const team = userFactory.buildList(5);                      // Five unique users
```

---

## Quick Start

```bash
npm install test-data-factory
```

```typescript
import { define, faker } from 'test-data-factory';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

const userFactory = define<User>({
  defaults: () => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'user',
  }),
  traits: {
    admin: () => ({ role: 'admin' }),
  },
});

// Use in tests
const user = userFactory.build();
const admin = userFactory.buildWith('admin');
const users = userFactory.buildList(10);
const custom = userFactory.build({ name: 'Alice', role: 'admin' });
```

---

## API

### `define<T>(config)`

Create a new factory.

```typescript
const factory = define<MyType>({
  defaults: () => ({ ... }),     // Required: function returning default values
  traits: {                      // Optional: named variants
    traitName: (defaults) => ({ ... }),
  },
});
```

### Factory Methods

| Method | Description |
|---|---|
| `build(overrides?)` | Build one instance with optional overrides |
| `buildWith(trait, overrides?)` | Build with a named trait + optional overrides |
| `buildList(count, overrides?)` | Build multiple instances |
| `buildListWith(trait, count, overrides?)` | Build multiple with a trait |
| `sequence(name)` | Auto-incrementing counter per factory |
| `resetSequences()` | Reset all sequence counters |
| `extend(config)` | Create a child factory with additional fields |

### Registry (Global)

```typescript
import { register, build, buildList } from 'test-data-factory';

register('user', userFactory);
const user = build<User>('user');
const users = buildList<User>('user', 5);
```

---

## Built-in Factories

Ready-to-use factories for common entities:

### User

```typescript
import { userFactory } from 'test-data-factory';

userFactory.build();                    // { id, email, firstName, lastName, role, profile, ... }
userFactory.buildWith('admin');         // Admin user
userFactory.buildWith('inactive');      // Inactive user
userFactory.buildWith('newUser');       // Fresh signup with empty profile
```

### Product

```typescript
import { productFactory } from 'test-data-factory';

productFactory.build();                 // { id, name, slug, price, category, metadata, ... }
productFactory.buildWith('outOfStock'); // quantity: 0, inStock: false
productFactory.buildWith('expensive');  // price: $500-5000
productFactory.buildWith('digital');    // weight: 0, tags: ['digital']
```

### Order (with associations)

```typescript
import { orderFactory } from 'test-data-factory';

orderFactory.build();                   // Full order with customer (User) + items (Product[])
orderFactory.buildWith('shipped');      // status: 'shipped'
orderFactory.buildWith('singleItem');   // Exactly one item, correct totals
```

---

## Deep Overrides

Override nested properties without spreading:

```typescript
const user = userFactory.build({
  profile: { bio: 'Custom bio' },
  // avatar and timezone are preserved from defaults
});
```

---

## Traits

Named variants that modify defaults:

```typescript
const factory = define<User>({
  defaults: () => ({ role: 'user', isActive: true }),
  traits: {
    admin: () => ({ role: 'admin' }),
    suspended: (defaults) => ({
      isActive: false,
      role: defaults.role, // Can reference base defaults
    }),
  },
});

// Combine trait + override
factory.buildWith('admin', { email: 'boss@company.com' });
```

---

## Sequences

Auto-incrementing counters for unique values:

```typescript
const factory = define<User>({
  defaults: () => ({
    id: `user-${factory.sequence('id')}`,
    email: `user${factory.sequence('email')}@test.com`,
  }),
});
// user-1, user-2, user-3...
```

---

## Project Structure

```
test-data-factory/
├── src/
│   ├── core/
│   │   ├── factory.ts       # Factory class with build/traits/sequences
│   │   └── registry.ts      # Global factory registry
│   ├── factories/
│   │   ├── user.factory.ts      # User (4 traits)
│   │   ├── product.factory.ts   # Product (3 traits)
│   │   └── order.factory.ts     # Order with associations (4 traits)
│   └── index.ts
└── tests/unit/
    ├── factory.test.ts          # 11 tests — core factory mechanics
    ├── registry.test.ts         # 6 tests — global registry
    └── builtin-factories.test.ts # 12 tests — user/product/order factories
```

---

## License

MIT

---

Built by [Quvantic](https://quvantic.com)
