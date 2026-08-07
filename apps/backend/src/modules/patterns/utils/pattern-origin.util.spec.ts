import { collectPatternOriginIds, type PatternOriginNodeLike } from './pattern-origin.util';

describe('collectPatternOriginIds', () => {
  it('collects a top-level meta.patternOrigin.patternId', () => {
    const nodes: PatternOriginNodeLike[] = [
      { meta: { patternOrigin: { patternId: 'pattern-1' } } },
    ];
    expect(collectPatternOriginIds(nodes)).toEqual(['pattern-1']);
  });

  it('recurses into children at any depth', () => {
    const nodes: PatternOriginNodeLike[] = [
      {
        meta: {},
        children: [
          { meta: { patternOrigin: { patternId: 'pattern-1' } }, children: [{ meta: {} }] },
        ],
      },
    ];
    expect(collectPatternOriginIds(nodes)).toEqual(['pattern-1']);
  });

  it('deduplicates repeated ids across multiple nodes', () => {
    const nodes: PatternOriginNodeLike[] = [
      { meta: { patternOrigin: { patternId: 'pattern-1' } } },
      { meta: { patternOrigin: { patternId: 'pattern-1' } } },
    ];
    expect(collectPatternOriginIds(nodes)).toEqual(['pattern-1']);
  });

  it('collects multiple distinct pattern ids', () => {
    const nodes: PatternOriginNodeLike[] = [
      { meta: { patternOrigin: { patternId: 'pattern-1' } } },
      { meta: { patternOrigin: { patternId: 'pattern-2' } } },
    ];
    expect(collectPatternOriginIds(nodes).sort()).toEqual(['pattern-1', 'pattern-2']);
  });

  it('ignores blocks with no meta or no patternOrigin', () => {
    const nodes: PatternOriginNodeLike[] = [{ meta: { anchor: 'foo' } }, {}];
    expect(collectPatternOriginIds(nodes)).toEqual([]);
  });

  it('ignores a malformed patternOrigin (non-string patternId)', () => {
    const nodes: PatternOriginNodeLike[] = [{ meta: { patternOrigin: { patternId: 123 } } }];
    expect(collectPatternOriginIds(nodes)).toEqual([]);
  });

  it('returns an empty array for undefined input', () => {
    expect(collectPatternOriginIds(undefined)).toEqual([]);
  });
});
