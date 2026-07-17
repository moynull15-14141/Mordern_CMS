import {
  buildCommentTree,
  getCommentDescendants,
  wouldCreateCommentCycle,
} from './comment-tree.util';

interface Node {
  id: string;
  parentId: string | null;
}

const flat: Node[] = [
  { id: 'a', parentId: null },
  { id: 'b', parentId: null },
  { id: 'a1', parentId: 'a' },
  { id: 'a2', parentId: 'a' },
  { id: 'a1a', parentId: 'a1' },
];

describe('buildCommentTree', () => {
  it('groups top-level nodes at the root', () => {
    const tree = buildCommentTree(flat);
    expect(tree.map((n) => n.id).sort()).toEqual(['a', 'b']);
  });

  it('nests direct children under their parent', () => {
    const tree = buildCommentTree(flat);
    const a = tree.find((n) => n.id === 'a')!;
    expect(a.children.map((c) => c.id).sort()).toEqual(['a1', 'a2']);
  });

  it('supports unlimited depth (grandchildren nested correctly)', () => {
    const tree = buildCommentTree(flat);
    const a = tree.find((n) => n.id === 'a')!;
    const a1 = a.children.find((c) => c.id === 'a1')!;
    expect(a1.children.map((c) => c.id)).toEqual(['a1a']);
  });

  it('a leaf node has an empty children array', () => {
    const tree = buildCommentTree(flat);
    const b = tree.find((n) => n.id === 'b')!;
    expect(b.children).toEqual([]);
  });

  it('returns an empty array for an empty input', () => {
    expect(buildCommentTree([])).toEqual([]);
  });

  it('can build a subtree rooted at a non-null parent', () => {
    const subtree = buildCommentTree(flat, 'a');
    expect(subtree.map((n) => n.id).sort()).toEqual(['a1', 'a2']);
  });
});

describe('getCommentDescendants', () => {
  it('returns every descendant across all levels', () => {
    const descendants = getCommentDescendants(flat, 'a');
    expect(descendants.map((n) => n.id).sort()).toEqual(['a1', 'a1a', 'a2']);
  });

  it('returns an empty array for a leaf node', () => {
    expect(getCommentDescendants(flat, 'a1a')).toEqual([]);
  });

  it('returns an empty array for an unknown id', () => {
    expect(getCommentDescendants(flat, 'unknown')).toEqual([]);
  });
});

describe('wouldCreateCommentCycle', () => {
  it('is true when the new parent is the node itself', () => {
    expect(wouldCreateCommentCycle(flat, 'a', 'a')).toBe(true);
  });

  it('is true when the new parent is a descendant', () => {
    expect(wouldCreateCommentCycle(flat, 'a', 'a1a')).toBe(true);
  });

  it('is false when the new parent is unrelated', () => {
    expect(wouldCreateCommentCycle(flat, 'a', 'b')).toBe(false);
  });

  it('is false when the new parent is the node’s own ancestor (not a cycle for the ancestor itself)', () => {
    expect(wouldCreateCommentCycle(flat, 'a1a', 'a')).toBe(false);
  });
});
