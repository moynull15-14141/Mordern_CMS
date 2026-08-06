import { describe, expect, it } from 'vitest';
import { parseBlocks } from './parse-blocks.util';

describe('parseBlocks', () => {
  it('extracts blocks from a well-formed body', () => {
    const blocks = [{ id: 'b1', type: 'paragraph', data: { text: 'x' } }];
    expect(parseBlocks({ blocks })).toBe(blocks);
  });

  it('returns an empty array for a body with no blocks array', () => {
    expect(parseBlocks({})).toEqual([]);
  });

  it('returns an empty array for a malformed/legacy body shape', () => {
    expect(parseBlocks({ text: 'legacy plain-text body' })).toEqual([]);
    expect(parseBlocks(null)).toEqual([]);
    expect(parseBlocks('a string')).toEqual([]);
    expect(parseBlocks({ blocks: 'not-an-array' })).toEqual([]);
  });
});
