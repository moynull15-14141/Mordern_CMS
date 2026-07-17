import { describe, expect, it } from 'vitest';
import { deepMerge } from './deep-merge';

describe('deepMerge', () => {
  it('merges top-level keys, source overriding target', () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('recursively merges nested plain objects', () => {
    const target = { user: { name: 'A', age: 20 } };
    const source = { user: { age: 21 } };
    expect(deepMerge(target, source)).toEqual({ user: { name: 'A', age: 21 } });
  });

  it('replaces arrays instead of merging them', () => {
    const target = { tags: ['a', 'b'] };
    const source = { tags: ['c'] };
    expect(deepMerge(target, source)).toEqual({ tags: ['c'] });
  });

  it('does not mutate the target or source inputs', () => {
    const target = { a: { b: 1 } };
    const source = { a: { b: 2 } };
    deepMerge(target, source);
    expect(target).toEqual({ a: { b: 1 } });
    expect(source).toEqual({ a: { b: 2 } });
  });

  it('overwrites a non-object target value with a nested source object', () => {
    expect(deepMerge({ a: 1 } as Record<string, unknown>, { a: { nested: true } })).toEqual({
      a: { nested: true },
    });
  });
});
