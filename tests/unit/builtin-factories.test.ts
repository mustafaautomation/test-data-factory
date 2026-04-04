import { describe, it, expect } from 'vitest';
import { userFactory } from '../../src/factories/user.factory';
import { productFactory } from '../../src/factories/product.factory';
import { orderFactory } from '../../src/factories/order.factory';

describe('User Factory', () => {
  it('should build a default user', () => {
    const user = userFactory.build();
    expect(user.id).toBeDefined();
    expect(user.email).toContain('@');
    expect(user.role).toBe('user');
    expect(user.isActive).toBe(true);
    expect(user.profile.timezone).toBeTruthy();
  });

  it('should build an admin user', () => {
    const admin = userFactory.buildWith('admin');
    expect(admin.role).toBe('admin');
  });

  it('should build an inactive user', () => {
    const inactive = userFactory.buildWith('inactive');
    expect(inactive.isActive).toBe(false);
  });

  it('should build a new user with empty profile', () => {
    const newUser = userFactory.buildWith('newUser');
    expect(newUser.profile.bio).toBe('');
  });
});

describe('Product Factory', () => {
  it('should build a default product', () => {
    const product = productFactory.build();
    expect(product.id).toBeDefined();
    expect(product.name).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.inStock).toBe(true);
    expect(product.metadata.sku).toHaveLength(8);
  });

  it('should build an out-of-stock product', () => {
    const product = productFactory.buildWith('outOfStock');
    expect(product.inStock).toBe(false);
    expect(product.quantity).toBe(0);
  });

  it('should build a digital product', () => {
    const product = productFactory.buildWith('digital');
    expect(product.metadata.weight).toBe(0);
    expect(product.tags).toContain('digital');
  });
});

describe('Order Factory', () => {
  it('should build a default order with items', () => {
    const order = orderFactory.build();
    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^ORD-\d{8}$/);
    expect(order.customer.email).toContain('@');
    expect(order.items.length).toBeGreaterThan(0);
    expect(order.subtotal).toBeGreaterThan(0);
    expect(order.tax).toBeGreaterThan(0);
    expect(order.total).toBeGreaterThan(order.subtotal);
    expect(order.status).toBe('pending');
    expect(order.shippingAddress.country).toBe('US');
  });

  it('should build a shipped order', () => {
    const order = orderFactory.buildWith('shipped');
    expect(order.status).toBe('shipped');
  });

  it('should build a single-item order', () => {
    const order = orderFactory.buildWith('singleItem');
    expect(order.items).toHaveLength(1);
    expect(order.total).toBeCloseTo(order.subtotal + order.tax, 2);
  });

  it('should compute totals correctly', () => {
    const order = orderFactory.build();
    const expectedSubtotal = order.items.reduce((sum, item) => sum + item.total, 0);
    expect(order.subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(order.tax).toBeCloseTo(order.subtotal * 0.08, 2);
  });
});
