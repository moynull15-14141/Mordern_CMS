import { collectReusableBlockReferenceIds } from './block-tree-references.util';

describe('collectReusableBlockReferenceIds', () => {
  it('returns an empty array for no nodes', () => {
    expect(collectReusableBlockReferenceIds(undefined)).toEqual([]);
    expect(collectReusableBlockReferenceIds([])).toEqual([]);
  });

  it('returns an empty array when nothing references a reusable block', () => {
    const nodes = [{ type: 'paragraph', data: { text: 'hi' } }];
    expect(collectReusableBlockReferenceIds(nodes)).toEqual([]);
  });

  it('collects a top-level reference', () => {
    const nodes = [{ type: 'reusable-block', data: { reusableBlockId: 'rb-1' } }];
    expect(collectReusableBlockReferenceIds(nodes)).toEqual(['rb-1']);
  });

  it('collects a reference nested inside a container at any depth', () => {
    const nodes = [
      {
        type: 'container',
        data: {},
        children: [
          {
            type: 'columns',
            data: { columnCount: '2' },
            children: [{ type: 'reusable-block', data: { reusableBlockId: 'rb-2' } }],
          },
        ],
      },
    ];
    expect(collectReusableBlockReferenceIds(nodes)).toEqual(['rb-2']);
  });

  it('deduplicates repeated references to the same id', () => {
    const nodes = [
      { type: 'reusable-block', data: { reusableBlockId: 'rb-1' } },
      { type: 'reusable-block', data: { reusableBlockId: 'rb-1' } },
    ];
    expect(collectReusableBlockReferenceIds(nodes)).toEqual(['rb-1']);
  });

  it('ignores a reusable-block node with a missing/empty/non-string id', () => {
    const nodes = [
      { type: 'reusable-block', data: {} },
      { type: 'reusable-block', data: { reusableBlockId: '' } },
      { type: 'reusable-block', data: { reusableBlockId: 42 } },
    ];
    expect(collectReusableBlockReferenceIds(nodes)).toEqual([]);
  });
});
