import { describe, expect, it } from 'vitest';
import { pagesKeys } from './query-keys';

describe('pagesKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(pagesKeys.all).toEqual(['pages']);
    expect(pagesKeys.lists()).toEqual(['pages', 'list']);
    expect(pagesKeys.details()).toEqual(['pages', 'detail']);
    expect(pagesKeys.detail('p1')).toEqual(['pages', 'detail', 'p1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(pagesKeys.list({ status: 'DRAFT' })).toEqual(['pages', 'list', { status: 'DRAFT' }]);
  });
});
