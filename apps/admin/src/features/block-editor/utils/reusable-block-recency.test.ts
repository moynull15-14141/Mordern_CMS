import { beforeEach, describe, expect, it } from 'vitest';
import {
  getRecentlyUsedReusableBlockIds,
  recordRecentlyUsedReusableBlock,
} from './reusable-block-recency';

beforeEach(() => {
  window.localStorage.clear();
});

describe('reusable-block-recency', () => {
  it('returns an empty array when nothing has been recorded', () => {
    expect(getRecentlyUsedReusableBlockIds()).toEqual([]);
  });

  it('records an id and returns it most-recent-first', () => {
    recordRecentlyUsedReusableBlock('a');
    recordRecentlyUsedReusableBlock('b');
    expect(getRecentlyUsedReusableBlockIds()).toEqual(['b', 'a']);
  });

  it('moves a re-recorded id to the front instead of duplicating it', () => {
    recordRecentlyUsedReusableBlock('a');
    recordRecentlyUsedReusableBlock('b');
    recordRecentlyUsedReusableBlock('a');
    expect(getRecentlyUsedReusableBlockIds()).toEqual(['a', 'b']);
  });

  it('caps the list at 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      recordRecentlyUsedReusableBlock(`id-${i}`);
    }
    const ids = getRecentlyUsedReusableBlockIds();
    expect(ids).toHaveLength(10);
    expect(ids[0]).toBe('id-14');
  });

  it('degrades to an empty array when stored JSON is malformed', () => {
    window.localStorage.setItem('block-editor:recent-reusable-blocks', 'not json');
    expect(getRecentlyUsedReusableBlockIds()).toEqual([]);
  });
});
