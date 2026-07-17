import { describe, expect, it } from 'vitest';
import { queryKeys, resourceKeys } from './query-keys';

describe('queryKeys', () => {
  it('produces a stable auth.me() key', () => {
    expect(queryKeys.auth.me()).toEqual(['auth', 'me']);
  });

  it('produces a stable authorization.me() key', () => {
    expect(queryKeys.authorization.me()).toEqual(['authorization', 'me']);
  });
});

describe('resourceKeys', () => {
  const keys = resourceKeys('articles');

  it('builds the "all" key from the resource name', () => {
    expect(keys.all).toEqual(['articles']);
  });

  it('builds the "lists" key', () => {
    expect(keys.lists()).toEqual(['articles', 'list']);
  });

  it('builds a filtered "list" key including the filters object', () => {
    expect(keys.list({ status: 'published' })).toEqual([
      'articles',
      'list',
      { status: 'published' },
    ]);
  });

  it('builds the "details" key', () => {
    expect(keys.details()).toEqual(['articles', 'detail']);
  });

  it('builds a specific "detail" key including the id', () => {
    expect(keys.detail('abc-123')).toEqual(['articles', 'detail', 'abc-123']);
  });
});
