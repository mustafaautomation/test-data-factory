import { define, faker } from '../core/factory';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  inStock: boolean;
  quantity: number;
  tags: string[];
  metadata: {
    sku: string;
    weight: number;
    dimensions: { width: number; height: number; depth: number };
  };
}

export const productFactory = define<Product>({
  defaults: () => {
    const name = faker.commerce.productName();
    return {
      id: faker.string.uuid(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
      currency: 'USD',
      category: faker.commerce.department(),
      inStock: true,
      quantity: faker.number.int({ min: 1, max: 100 }),
      tags: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () =>
        faker.commerce.productAdjective(),
      ),
      metadata: {
        sku: faker.string.alphanumeric(8).toUpperCase(),
        weight: parseFloat(faker.number.float({ min: 0.1, max: 50, fractionDigits: 1 }).toFixed(1)),
        dimensions: {
          width: faker.number.int({ min: 5, max: 100 }),
          height: faker.number.int({ min: 5, max: 100 }),
          depth: faker.number.int({ min: 5, max: 50 }),
        },
      },
    };
  },
  traits: {
    outOfStock: () => ({
      inStock: false,
      quantity: 0,
    }),
    expensive: () => ({
      price: parseFloat(faker.commerce.price({ min: 500, max: 5000 })),
      category: 'Premium',
    }),
    digital: () => ({
      metadata: {
        sku: faker.string.alphanumeric(8).toUpperCase(),
        weight: 0,
        dimensions: { width: 0, height: 0, depth: 0 },
      },
      tags: ['digital', 'downloadable'],
    }),
  },
});
