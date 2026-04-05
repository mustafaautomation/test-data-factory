import { describe, it, expect } from 'vitest';
import { Factory, define } from '../../src/core/factory';

interface SimpleItem {
  id: number;
  name: string;
  active: boolean;
}

interface NestedItem {
  id: number;
  config: {
    theme: string;
    settings: {
      notifications: boolean;
      language: string;
    };
  };
}

const simpleFactory = define<SimpleItem>({
  defaults: () => ({ id: 1, name: 'default', active: true }),
  traits: {
    inactive: () => ({ active: false }),
    named: () => ({ name: 'trait-name' }),
  },
});

const nestedFactory = define<NestedItem>({
  defaults: () => ({
    id: 1,
    config: {
      theme: 'dark',
      settings: { notifications: true, language: 'en' },
    },
  }),
});

describe('Factory — deep merge', () => {
  it('should merge top-level overrides', () => {
    const item = simpleFactory.build({ name: 'custom' });
    expect(item.name).toBe('custom');
    expect(item.id).toBe(1); // default preserved
    expect(item.active).toBe(true); // default preserved
  });

  it('should deep merge nested objects', () => {
    const item = nestedFactory.build({
      config: { settings: { language: 'fr' } },
    });
    expect(item.config.settings.language).toBe('fr');
    expect(item.config.settings.notifications).toBe(true); // preserved
    expect(item.config.theme).toBe('dark'); // preserved
  });

  it('should not mutate defaults between builds', () => {
    const a = simpleFactory.build({ name: 'first' });
    const b = simpleFactory.build();
    expect(a.name).toBe('first');
    expect(b.name).toBe('default');
  });
});

describe('Factory — traits', () => {
  it('should apply trait overrides', () => {
    const item = simpleFactory.buildWith('inactive');
    expect(item.active).toBe(false);
    expect(item.name).toBe('default'); // non-trait fields preserved
  });

  it('should apply trait + manual overrides', () => {
    const item = simpleFactory.buildWith('inactive', { name: 'custom' });
    expect(item.active).toBe(false);
    expect(item.name).toBe('custom');
  });

  it('should throw on unknown trait', () => {
    expect(() => simpleFactory.buildWith('nonexistent')).toThrow('Unknown trait');
    expect(() => simpleFactory.buildWith('nonexistent')).toThrow('Available:');
  });

  it('should list available traits in error', () => {
    try {
      simpleFactory.buildWith('bad');
    } catch (e) {
      expect((e as Error).message).toContain('inactive');
      expect((e as Error).message).toContain('named');
    }
  });
});

describe('Factory — sequences', () => {
  it('should auto-increment sequences', () => {
    const factory = define<{ id: number; name: string }>({
      defaults: () => ({ id: 0, name: 'item' }),
    });

    expect(factory.sequence('counter')).toBe(1);
    expect(factory.sequence('counter')).toBe(2);
    expect(factory.sequence('counter')).toBe(3);
  });

  it('should maintain independent sequences', () => {
    const factory = define<{ id: number }>({ defaults: () => ({ id: 0 }) });

    factory.sequence('users');
    factory.sequence('users');
    factory.sequence('orders');

    expect(factory.sequence('users')).toBe(3);
    expect(factory.sequence('orders')).toBe(2);
  });

  it('should reset all sequences', () => {
    const factory = define<{ id: number }>({ defaults: () => ({ id: 0 }) });

    factory.sequence('a');
    factory.sequence('b');
    factory.resetSequences();

    expect(factory.sequence('a')).toBe(1);
    expect(factory.sequence('b')).toBe(1);
  });
});

describe('Factory — buildList', () => {
  it('should build list of specified length', () => {
    const items = simpleFactory.buildList(5);
    expect(items).toHaveLength(5);
    items.forEach((item) => {
      expect(item.id).toBe(1);
      expect(item.name).toBe('default');
    });
  });

  it('should apply overrides to all items in list', () => {
    const items = simpleFactory.buildList(3, { active: false });
    items.forEach((item) => {
      expect(item.active).toBe(false);
    });
  });

  it('should build list with trait', () => {
    const items = simpleFactory.buildListWith('inactive', 4);
    expect(items).toHaveLength(4);
    items.forEach((item) => {
      expect(item.active).toBe(false);
    });
  });

  it('should build empty list', () => {
    expect(simpleFactory.buildList(0)).toHaveLength(0);
  });
});

describe('Factory — extend', () => {
  interface BaseEntity {
    id: number;
    createdAt: string;
  }

  it('should extend factory with additional defaults', () => {
    const baseFactory = define<BaseEntity>({
      defaults: () => ({ id: 1, createdAt: '2026-01-01' }),
    });

    const extendedFactory = baseFactory.extend<{ name: string; role: string }>({
      defaults: () => ({ name: 'Extended', role: 'user' }),
    });

    const item = extendedFactory.build();
    expect(item.id).toBe(1);
    expect(item.createdAt).toBe('2026-01-01');
    expect(item.name).toBe('Extended');
    expect(item.role).toBe('user');
  });

  it('should merge traits from parent and child', () => {
    const baseFactory = define<BaseEntity>({
      defaults: () => ({ id: 1, createdAt: '2026-01-01' }),
      traits: {
        old: () => ({ createdAt: '2020-01-01' }),
      },
    });

    const extendedFactory = baseFactory.extend<{ name: string }>({
      defaults: () => ({ name: 'test' }),
      traits: {
        named: () => ({ name: 'trait-name' }),
      },
    });

    // Parent trait should work
    const old = extendedFactory.buildWith('old');
    expect(old.createdAt).toBe('2020-01-01');

    // Child trait should work
    const named = extendedFactory.buildWith('named');
    expect(named.name).toBe('trait-name');
  });
});

describe('define helper', () => {
  it('should create factory instance', () => {
    const factory = define<{ x: number }>({ defaults: () => ({ x: 42 }) });
    expect(factory).toBeInstanceOf(Factory);
    expect(factory.build().x).toBe(42);
  });
});
