import { describe, it, expect, beforeEach } from 'vitest';
import { register, get, build, buildList, clear, list } from '../../src/core/registry';
import { define, faker } from '../../src/core/factory';

interface Simple {
  id: string;
  value: number;
}

const simpleFactory = define<Simple>({
  defaults: () => ({ id: faker.string.uuid(), value: 42 }),
});

describe('Registry', () => {
  beforeEach(() => {
    clear();
  });

  it('should register and retrieve a factory', () => {
    register('simple', simpleFactory);
    const factory = get<Simple>('simple');
    expect(factory).toBeDefined();
    const item = factory.build();
    expect(item.value).toBe(42);
  });

  it('should build via registry shorthand', () => {
    register('simple', simpleFactory);
    const item = build<Simple>('simple');
    expect(item.value).toBe(42);
  });

  it('should build list via registry', () => {
    register('simple', simpleFactory);
    const items = buildList<Simple>('simple', 3);
    expect(items).toHaveLength(3);
  });

  it('should throw on unknown factory', () => {
    expect(() => get('unknown')).toThrow('Factory "unknown" not registered');
  });

  it('should list registered factories', () => {
    register('a', simpleFactory);
    register('b', simpleFactory);
    expect(list()).toEqual(['a', 'b']);
  });

  it('should clear all factories', () => {
    register('temp', simpleFactory);
    clear();
    expect(list()).toHaveLength(0);
  });
});
