import { Factory } from './factory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, Factory<any>>();

export function register<T extends object>(name: string, factory: Factory<T>): void {
  registry.set(name, factory);
}

export function get<T extends object>(name: string): Factory<T> {
  const factory = registry.get(name);
  if (!factory) {
    throw new Error(
      `Factory "${name}" not registered. Available: ${[...registry.keys()].join(', ')}`,
    );
  }
  return factory as Factory<T>;
}

export function build<T extends object>(name: string, overrides?: Partial<T>): T {
  return get<T>(name).build(overrides);
}

export function buildList<T extends object>(
  name: string,
  count: number,
  overrides?: Partial<T>,
): T[] {
  return get<T>(name).buildList(count, overrides);
}

export function clear(): void {
  registry.clear();
}

export function list(): string[] {
  return [...registry.keys()];
}
