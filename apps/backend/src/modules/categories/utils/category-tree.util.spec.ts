import { Category, CategoryStatus } from '@prisma/client';
import {
  buildTree,
  getAncestors,
  getBreadcrumb,
  getChildren,
  getDescendants,
  wouldCreateCycle,
} from './category-tree.util';

function cat(id: string, parentId: string | null, overrides: Partial<Category> = {}): Category {
  return {
    id,
    siteId: 'site-1',
    parentId,
    name: `Category ${id}`,
    slug: `category-${id}`,
    description: null,
    status: CategoryStatus.ACTIVE,
    seoMetaId: null,
    sortOrder: 0,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Category;
}

// Tree shape used across tests:
//   root-a
//     ├── child-a1
//     │     └── grandchild-a1a
//     └── child-a2
//   root-b
const CATEGORIES: Category[] = [
  cat('root-a', null, { sortOrder: 1 }),
  cat('root-b', null, { sortOrder: 2 }),
  cat('child-a1', 'root-a', { sortOrder: 1 }),
  cat('child-a2', 'root-a', { sortOrder: 2 }),
  cat('grandchild-a1a', 'child-a1'),
];

describe('category-tree.util', () => {
  describe('buildTree', () => {
    it('builds root nodes with nested children', () => {
      const tree = buildTree(CATEGORIES);
      expect(tree.map((n) => n.id)).toEqual(['root-a', 'root-b']);
      expect(tree[0].children.map((n) => n.id)).toEqual(['child-a1', 'child-a2']);
      expect(tree[0].children[0].children.map((n) => n.id)).toEqual(['grandchild-a1a']);
    });

    it('returns an empty array when there are no categories', () => {
      expect(buildTree([])).toEqual([]);
    });

    it('sorts siblings by sortOrder then name', () => {
      const unsorted = [cat('b', null, { sortOrder: 2 }), cat('a', null, { sortOrder: 1 })];
      const tree = buildTree(unsorted);
      expect(tree.map((n) => n.id)).toEqual(['a', 'b']);
    });

    it('leaf nodes have empty children arrays', () => {
      const tree = buildTree(CATEGORIES);
      const grandchild = tree[0].children[0].children[0];
      expect(grandchild.children).toEqual([]);
    });
  });

  describe('getChildren', () => {
    it('returns only direct children', () => {
      const children = getChildren(CATEGORIES, 'root-a');
      expect(children.map((c) => c.id).sort()).toEqual(['child-a1', 'child-a2']);
    });

    it('returns [] for a leaf node', () => {
      expect(getChildren(CATEGORIES, 'grandchild-a1a')).toEqual([]);
    });
  });

  describe('getDescendants', () => {
    it('returns all levels below a node', () => {
      const descendants = getDescendants(CATEGORIES, 'root-a');
      expect(descendants.map((c) => c.id).sort()).toEqual([
        'child-a1',
        'child-a2',
        'grandchild-a1a',
      ]);
    });

    it('returns [] for a leaf node', () => {
      expect(getDescendants(CATEGORIES, 'grandchild-a1a')).toEqual([]);
    });

    it('returns [] for a root with no children', () => {
      expect(getDescendants(CATEGORIES, 'root-b')).toEqual([]);
    });
  });

  describe('getAncestors', () => {
    it('returns ancestors root-first', () => {
      const ancestors = getAncestors(CATEGORIES, 'grandchild-a1a');
      expect(ancestors.map((c) => c.id)).toEqual(['root-a', 'child-a1']);
    });

    it('returns [] for a root category', () => {
      expect(getAncestors(CATEGORIES, 'root-a')).toEqual([]);
    });

    it('returns a single ancestor for a direct child', () => {
      const ancestors = getAncestors(CATEGORIES, 'child-a1');
      expect(ancestors.map((c) => c.id)).toEqual(['root-a']);
    });
  });

  describe('getBreadcrumb', () => {
    it('returns root-to-self path including the category itself', () => {
      const breadcrumb = getBreadcrumb(CATEGORIES, 'grandchild-a1a');
      expect(breadcrumb.map((c) => c.id)).toEqual(['root-a', 'child-a1', 'grandchild-a1a']);
    });

    it('returns just the category itself for a root', () => {
      const breadcrumb = getBreadcrumb(CATEGORIES, 'root-a');
      expect(breadcrumb.map((c) => c.id)).toEqual(['root-a']);
    });

    it('returns [] for an unknown id', () => {
      expect(getBreadcrumb(CATEGORIES, 'missing')).toEqual([]);
    });
  });

  describe('wouldCreateCycle', () => {
    it('is true when the new parent is the category itself', () => {
      expect(wouldCreateCycle(CATEGORIES, 'root-a', 'root-a')).toBe(true);
    });

    it('is true when the new parent is a descendant', () => {
      expect(wouldCreateCycle(CATEGORIES, 'root-a', 'grandchild-a1a')).toBe(true);
    });

    it('is false when the new parent is an unrelated root', () => {
      expect(wouldCreateCycle(CATEGORIES, 'child-a1', 'root-b')).toBe(false);
    });

    it('is false when the new parent is an ancestor (valid move up)', () => {
      expect(wouldCreateCycle(CATEGORIES, 'grandchild-a1a', 'root-a')).toBe(false);
    });
  });
});
