import { describe, expect, it } from 'vitest';
import { tagsKeys } from './query-keys';

describe('tagsKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(tagsKeys.all).toEqual(['tags']);
    expect(tagsKeys.lists()).toEqual(['tags', 'list']);
    expect(tagsKeys.details()).toEqual(['tags', 'detail']);
    expect(tagsKeys.detail('t1')).toEqual(['tags', 'detail', 't1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(tagsKeys.list({ search: 'news' })).toEqual(['tags', 'list', { search: 'news' }]);
  });
});
