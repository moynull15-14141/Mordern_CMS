import { beforeEach, describe, expect, it } from 'vitest';
import { getRecentlyUsedPatternIds, recordRecentlyUsedPattern } from './pattern-recency';

beforeEach(() => {
  window.localStorage.clear();
});

describe('pattern-recency', () => {
  it('returns an empty array when nothing has been recorded', () => {
    expect(getRecentlyUsedPatternIds()).toEqual([]);
  });

  it('records an id and returns it most-recent-first', () => {
    recordRecentlyUsedPattern('a');
    recordRecentlyUsedPattern('b');
    expect(getRecentlyUsedPatternIds()).toEqual(['b', 'a']);
  });

  it('moves a re-recorded id to the front instead of duplicating it', () => {
    recordRecentlyUsedPattern('a');
    recordRecentlyUsedPattern('b');
    recordRecentlyUsedPattern('a');
    expect(getRecentlyUsedPatternIds()).toEqual(['a', 'b']);
  });

  it('caps the list at 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      recordRecentlyUsedPattern(`id-${i}`);
    }
    const ids = getRecentlyUsedPatternIds();
    expect(ids).toHaveLength(10);
    expect(ids[0]).toBe('id-14');
  });

  it('degrades to an empty array when stored JSON is malformed', () => {
    window.localStorage.setItem('patterns:recently-used', 'not json');
    expect(getRecentlyUsedPatternIds()).toEqual([]);
  });
});
