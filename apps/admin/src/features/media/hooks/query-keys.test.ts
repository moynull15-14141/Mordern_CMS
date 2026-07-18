import { describe, expect, it } from 'vitest';
import { mediaFolderKeys, mediaKeys } from './query-keys';

describe('mediaKeys', () => {
  it('all/lists/details/detail come from the shared resourceKeys factory', () => {
    expect(mediaKeys.all).toEqual(['media']);
    expect(mediaKeys.lists()).toEqual(['media', 'list']);
    expect(mediaKeys.details()).toEqual(['media', 'detail']);
    expect(mediaKeys.detail('m1')).toEqual(['media', 'detail', 'm1']);
  });

  it('list() appends the filters object to the shared lists() key', () => {
    expect(mediaKeys.list({ type: 'IMAGE' })).toEqual(['media', 'list', { type: 'IMAGE' }]);
  });

  it('usages()/duplicates() are scoped per media asset', () => {
    expect(mediaKeys.usages('m1')).toEqual(['media', 'm1', 'usages']);
    expect(mediaKeys.duplicates('m1')).toEqual(['media', 'm1', 'duplicates']);
  });
});

describe('mediaFolderKeys', () => {
  it('tree() is a stable key', () => {
    expect(mediaFolderKeys.tree()).toEqual(['media-folders', 'tree']);
  });
});
