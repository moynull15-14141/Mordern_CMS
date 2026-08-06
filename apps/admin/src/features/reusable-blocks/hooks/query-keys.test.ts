import { describe, expect, it } from 'vitest';
import { reusableBlocksKeys } from './query-keys';

describe('reusableBlocksKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(reusableBlocksKeys.all).toEqual(['reusable-blocks']);
    expect(reusableBlocksKeys.lists()).toEqual(['reusable-blocks', 'list']);
    expect(reusableBlocksKeys.details()).toEqual(['reusable-blocks', 'detail']);
    expect(reusableBlocksKeys.detail('rb-1')).toEqual(['reusable-blocks', 'detail', 'rb-1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(reusableBlocksKeys.list({ search: 'cta' })).toEqual([
      'reusable-blocks',
      'list',
      { search: 'cta' },
    ]);
  });

  it('usages() is keyed by id, separate from detail()', () => {
    expect(reusableBlocksKeys.usages('rb-1')).toEqual(['reusable-blocks', 'usages', 'rb-1']);
  });
});
