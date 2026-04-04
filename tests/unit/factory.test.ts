import { describe, it, expect } from 'vitest';
import { define, faker } from '../../src/core/factory';

interface TestEntity {
  id: string;
  name: string;
  score: number;
  active: boolean;
  nested: { tag: string; count: number };
}

const testFactory = define<TestEntity>({
  defaults: () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    score: 100,
    active: true,
    nested: { tag: 'default', count: 0 },
  }),
  traits: {
    inactive: () => ({ active: false }),
    highScore: () => ({ score: 999 }),
    tagged: (defaults) => ({
      nested: { ...defaults.nested, tag: 'special' },
    }),
  },
});

describe('Factory', () => {
  it('should build with defaults', () => {
    const entity = testFactory.build();
    expect(entity.id).toBeDefined();
    expect(entity.name).toBeTruthy();
    expect(entity.score).toBe(100);
    expect(entity.active).toBe(true);
  });

  it('should build with overrides', () => {
    const entity = testFactory.build({ name: 'Custom', score: 50 });
    expect(entity.name).toBe('Custom');
    expect(entity.score).toBe(50);
    expect(entity.active).toBe(true); // default preserved
  });

  it('should build with deep overrides', () => {
    const entity = testFactory.build({ nested: { tag: 'overridden', count: 5 } });
    expect(entity.nested.tag).toBe('overridden');
    expect(entity.nested.count).toBe(5);
  });

  it('should build with trait', () => {
    const entity = testFactory.buildWith('inactive');
    expect(entity.active).toBe(false);
    expect(entity.score).toBe(100); // other defaults preserved
  });

  it('should build with trait and overrides', () => {
    const entity = testFactory.buildWith('highScore', { name: 'Champion' });
    expect(entity.score).toBe(999);
    expect(entity.name).toBe('Champion');
  });

  it('should throw on unknown trait', () => {
    expect(() => testFactory.buildWith('nonexistent')).toThrow('Unknown trait: "nonexistent"');
  });

  it('should build a list', () => {
    const entities = testFactory.buildList(5);
    expect(entities).toHaveLength(5);
    // Each should have a unique id
    const ids = entities.map((e) => e.id);
    expect(new Set(ids).size).toBe(5);
  });

  it('should build a list with trait', () => {
    const entities = testFactory.buildListWith('inactive', 3);
    expect(entities).toHaveLength(3);
    expect(entities.every((e) => !e.active)).toBe(true);
  });

  it('should provide sequences', () => {
    const seq1 = testFactory.sequence('counter');
    const seq2 = testFactory.sequence('counter');
    const seq3 = testFactory.sequence('counter');
    expect(seq1).toBe(1);
    expect(seq2).toBe(2);
    expect(seq3).toBe(3);
  });

  it('should reset sequences', () => {
    testFactory.sequence('reset-test');
    testFactory.resetSequences();
    expect(testFactory.sequence('reset-test')).toBe(1);
  });

  it('should generate unique data on each build', () => {
    const a = testFactory.build();
    const b = testFactory.build();
    expect(a.id).not.toBe(b.id);
  });
});
