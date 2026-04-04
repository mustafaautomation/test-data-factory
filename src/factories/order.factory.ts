import { define, faker } from '../core/factory';
import { userFactory, User } from './user.factory';
import { productFactory, Product } from './product.factory';

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: User;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: Date;
}

function buildOrderItems(count: number): OrderItem[] {
  return Array.from({ length: count }, () => {
    const product = productFactory.build();
    const quantity = faker.number.int({ min: 1, max: 5 });
    return {
      product,
      quantity,
      unitPrice: product.price,
      total: Math.round(product.price * quantity * 100) / 100,
    };
  });
}

export const orderFactory = define<Order>({
  defaults: () => {
    const items = buildOrderItems(faker.number.int({ min: 1, max: 4 }));
    const subtotal = Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;

    return {
      id: faker.string.uuid(),
      orderNumber: `ORD-${faker.string.numeric(8)}`,
      customer: userFactory.build(),
      items,
      subtotal,
      tax,
      total: Math.round((subtotal + tax) * 100) / 100,
      status: 'pending',
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zip: faker.location.zipCode(),
        country: 'US',
      },
      createdAt: faker.date.recent({ days: 30 }),
    };
  },
  traits: {
    confirmed: () => ({ status: 'confirmed' as const }),
    shipped: () => ({ status: 'shipped' as const }),
    delivered: () => ({ status: 'delivered' as const }),
    cancelled: () => ({ status: 'cancelled' as const }),
    singleItem: () => {
      const items = buildOrderItems(1);
      const subtotal = items[0].total;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      return {
        items,
        subtotal,
        tax,
        total: Math.round((subtotal + tax) * 100) / 100,
      };
    },
  },
});
