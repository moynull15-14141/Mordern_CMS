import { buildMenuItemTree, wouldCreateCycle, type MenuItemNode } from './menu-item-tree.util';

function node(id: string, parentId: string | null, sortOrder = 0): MenuItemNode {
  return { id, parentId, sortOrder };
}

describe('buildMenuItemTree', () => {
  it('returns an empty array for no nodes', () => {
    expect(buildMenuItemTree([])).toEqual([]);
  });

  it('nests children under their parent', () => {
    const nodes = [node('a', null), node('b', 'a'), node('c', 'a')];
    const tree = buildMenuItemTree(nodes);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('a');
    expect(tree[0].children.map((c) => c.id)).toEqual(['b', 'c']);
  });

  it('supports unlimited depth', () => {
    const nodes = [node('a', null), node('b', 'a'), node('c', 'b'), node('d', 'c')];
    const tree = buildMenuItemTree(nodes);
    expect(tree[0].children[0].children[0].children[0].id).toBe('d');
  });

  it('sorts siblings by sortOrder', () => {
    const nodes = [node('a', null, 2), node('b', null, 0), node('c', null, 1)];
    const tree = buildMenuItemTree(nodes);
    expect(tree.map((n) => n.id)).toEqual(['b', 'c', 'a']);
  });

  it('supports multiple root items', () => {
    const nodes = [node('a', null), node('b', null)];
    const tree = buildMenuItemTree(nodes);
    expect(tree).toHaveLength(2);
  });
});

describe('wouldCreateCycle', () => {
  it('returns true when newParentId is the node itself', () => {
    const nodes = [node('a', null)];
    expect(wouldCreateCycle(nodes, 'a', 'a')).toBe(true);
  });

  it('returns true when newParentId is a descendant of the node', () => {
    const nodes = [node('a', null), node('b', 'a'), node('c', 'b')];
    expect(wouldCreateCycle(nodes, 'a', 'c')).toBe(true);
  });

  it('returns false for a valid, non-circular reparent', () => {
    const nodes = [node('a', null), node('b', null), node('c', 'b')];
    expect(wouldCreateCycle(nodes, 'a', 'c')).toBe(false);
  });
});
