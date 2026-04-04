import { faker } from '@faker-js/faker';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DefaultsFn<T> = () => T;
type TraitFn<T> = (defaults: T) => DeepPartial<T>;

interface FactoryConfig<T> {
  defaults: DefaultsFn<T>;
  traits?: Record<string, TraitFn<T>>;
}

export class Factory<T extends object> {
  private defaultsFn: DefaultsFn<T>;
  private traits: Record<string, TraitFn<T>>;
  private sequences: Map<string, number> = new Map();

  constructor(config: FactoryConfig<T>) {
    this.defaultsFn = config.defaults;
    this.traits = config.traits || {};
  }

  build(overrides?: DeepPartial<T>): T {
    const base = this.defaultsFn();
    if (overrides) {
      return this.deepMerge(base, overrides);
    }
    return base;
  }

  buildWith(traitName: string, overrides?: DeepPartial<T>): T {
    const trait = this.traits[traitName];
    if (!trait) {
      throw new Error(
        `Unknown trait: "${traitName}". Available: ${Object.keys(this.traits).join(', ')}`,
      );
    }
    const base = this.defaultsFn();
    const traitOverrides = trait(base);
    const merged = this.deepMerge(base, traitOverrides);
    if (overrides) {
      return this.deepMerge(merged, overrides);
    }
    return merged;
  }

  buildList(count: number, overrides?: DeepPartial<T>): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  buildListWith(traitName: string, count: number, overrides?: DeepPartial<T>): T[] {
    return Array.from({ length: count }, () => this.buildWith(traitName, overrides));
  }

  sequence(name: string): number {
    const current = this.sequences.get(name) || 0;
    const next = current + 1;
    this.sequences.set(name, next);
    return next;
  }

  resetSequences(): void {
    this.sequences.clear();
  }

  extend<U extends object>(config: FactoryConfig<U>): Factory<T & U> {
    const parentDefaults = this.defaultsFn;
    const childDefaults = config.defaults;
    const mergedTraits = { ...this.traits, ...config.traits } as Record<string, TraitFn<T & U>>;

    return new Factory<T & U>({
      defaults: () => ({ ...parentDefaults(), ...childDefaults() }),
      traits: mergedTraits,
    });
  }

  private deepMerge(target: T, source: DeepPartial<T>): T {
    const result = { ...target };
    for (const key of Object.keys(source) as Array<keyof T>) {
      const sourceVal = source[key];
      if (sourceVal !== undefined) {
        if (
          typeof sourceVal === 'object' &&
          sourceVal !== null &&
          !Array.isArray(sourceVal) &&
          typeof target[key] === 'object' &&
          target[key] !== null
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result[key] = this.deepMerge(target[key] as any, sourceVal as any) as T[keyof T];
        } else {
          result[key] = sourceVal as T[keyof T];
        }
      }
    }
    return result;
  }
}

export function define<T extends object>(config: FactoryConfig<T>): Factory<T> {
  return new Factory(config);
}

export { faker };
