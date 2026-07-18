import { describe, expect, it } from 'vitest';
import { themesKeys } from './query-keys';

describe('themesKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(themesKeys.all).toEqual(['themes']);
    expect(themesKeys.lists()).toEqual(['themes', 'list']);
    expect(themesKeys.details()).toEqual(['themes', 'detail']);
    expect(themesKeys.detail('t1')).toEqual(['themes', 'detail', 't1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(themesKeys.list({ status: 'DRAFT' })).toEqual(['themes', 'list', { status: 'DRAFT' }]);
  });

  it('active() is a stable key', () => {
    expect(themesKeys.active()).toEqual(['themes', 'active']);
  });
});
