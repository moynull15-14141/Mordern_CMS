import { describe, expect, it } from 'vitest';
import { categoriesKeys } from './query-keys';

describe('categoriesKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(categoriesKeys.all).toEqual(['categories']);
    expect(categoriesKeys.lists()).toEqual(['categories', 'list']);
    expect(categoriesKeys.details()).toEqual(['categories', 'detail']);
    expect(categoriesKeys.detail('c1')).toEqual(['categories', 'detail', 'c1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(categoriesKeys.list({ status: 'ACTIVE' })).toEqual(['categories', 'list', { status: 'ACTIVE' }]);
  });

  it('tree()/flat() are stable keys', () => {
    expect(categoriesKeys.tree()).toEqual(['categories', 'tree']);
    expect(categoriesKeys.flat()).toEqual(['categories', 'flat']);
  });

  it('children()/descendants()/breadcrumb() are scoped per category', () => {
    expect(categoriesKeys.children('c1')).toEqual(['categories', 'c1', 'children']);
    expect(categoriesKeys.descendants('c1')).toEqual(['categories', 'c1', 'descendants']);
    expect(categoriesKeys.breadcrumb('c1')).toEqual(['categories', 'c1', 'breadcrumb']);
  });
});
