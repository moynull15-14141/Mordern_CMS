import { describe, expect, it } from 'vitest';
import { buildQueryParams } from './query-builder';

describe('buildQueryParams', () => {
  it('drops undefined, null, and empty-string values', () => {
    expect(buildQueryParams({ a: undefined, b: null, c: '', d: 'kept' })).toEqual({ d: 'kept' });
  });

  it('keeps strings, numbers, and booleans', () => {
    expect(buildQueryParams({ s: 'x', n: 5, b: false })).toEqual({ s: 'x', n: 5, b: false });
  });

  it('joins non-empty arrays with commas', () => {
    expect(buildQueryParams({ tags: ['a', 'b', 'c'] })).toEqual({ tags: 'a,b,c' });
  });

  it('drops empty arrays', () => {
    expect(buildQueryParams({ tags: [] })).toEqual({});
  });

  it('ignores values of unsupported types', () => {
    expect(buildQueryParams({ fn: () => undefined, obj: { nested: true } })).toEqual({});
  });
});
