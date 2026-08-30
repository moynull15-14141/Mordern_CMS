import { describe, expect, it } from 'vitest';
import {
  countItems,
  findParentId,
  flattenForParentOptions,
  getSiblings,
  getSubtreeIds,
  moveItem,
  toReorderPayload,
} from './menu-item-tree.util';
import type { MenuItem } from '../types/menu';

function item(overrides: Partial<MenuItem> & { id: string; label: string }): MenuItem {
  return {
    menuId: 'm1',
    parentId: null,
    targetType: 'EXTERNAL_URL',
    pageId: null,
    articleId: null,
    categoryId: null,
    url: 'https://example.com',
    openMode: 'SELF',
    icon: null,
    cssClass: null,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    children: [],
    ...overrides,
  };
}

/** Home, About, Services (-> Web Design, Development, Marketing), Contact
 * — the exact structure the spec's manual verification flow builds. */
function sampleTree(): MenuItem[] {
  return [
    item({ id: 'home', label: 'Home' }),
    item({ id: 'about', label: 'About' }),
    item({
      id: 'services',
      label: 'Services',
      children: [
        item({ id: 'web-design', label: 'Web Design', parentId: 'services' }),
        item({ id: 'development', label: 'Development', parentId: 'services' }),
        item({ id: 'marketing', label: 'Marketing', parentId: 'services' }),
      ],
    }),
    item({ id: 'contact', label: 'Contact' }),
  ];
}

describe('countItems', () => {
  it('counts every node at every depth', () => {
    expect(countItems(sampleTree())).toBe(7);
  });

  it('is 0 for an empty tree', () => {
    expect(countItems([])).toBe(0);
  });
});

describe('findParentId / getSiblings', () => {
  it('returns null for a top-level item', () => {
    expect(findParentId(sampleTree(), 'about')).toBeNull();
  });

  it('finds the real parent of a nested item', () => {
    expect(findParentId(sampleTree(), 'web-design')).toBe('services');
  });

  it('returns the top-level array as siblings for parentId null', () => {
    const tree = sampleTree();
    expect(getSiblings(tree, null)).toHaveLength(4);
  });

  it("returns a nested item's children as its siblings", () => {
    expect(getSiblings(sampleTree(), 'services')).toHaveLength(3);
  });
});

describe('getSubtreeIds', () => {
  it('includes the node itself and every descendant', () => {
    const services = sampleTree()[2];
    const ids = getSubtreeIds(services);
    expect(ids).toEqual(new Set(['services', 'web-design', 'development', 'marketing']));
  });
});

describe('moveItem — reorder', () => {
  it('moves an item up within the same level', () => {
    const next = moveItem(sampleTree(), 'contact', null, 0);
    expect(next.map((i) => i.id)).toEqual(['contact', 'home', 'about', 'services']);
  });

  it('renumbers sortOrder contiguously after a move', () => {
    const next = moveItem(sampleTree(), 'contact', null, 0);
    expect(next.map((i) => i.sortOrder)).toEqual([0, 1, 2, 3]);
  });
});

describe('moveItem — nest / un-nest', () => {
  it('nests a top-level item under another (indent)', () => {
    const next = moveItem(sampleTree(), 'contact', 'services', 3);
    const services = next.find((i) => i.id === 'services')!;
    expect(services.children.map((c) => c.id)).toEqual([
      'web-design',
      'development',
      'marketing',
      'contact',
    ]);
    expect(next.map((i) => i.id)).not.toContain('contact');
  });

  it('un-nests a child back to top level (outdent)', () => {
    // Outdent places the item right after its former parent — index 3
    // is "services" own position + 1 in the post-detach top-level array.
    const next = moveItem(sampleTree(), 'web-design', null, 3);
    expect(next.map((i) => i.id)).toEqual(['home', 'about', 'services', 'web-design', 'contact']);
    const services = next.find((i) => i.id === 'services')!;
    expect(services.children.map((c) => c.id)).toEqual(['development', 'marketing']);
  });

  it('sets parentId to the new parent on the moved node', () => {
    const next = moveItem(sampleTree(), 'contact', 'services', 0);
    const services = next.find((i) => i.id === 'services')!;
    expect(services.children[0].parentId).toBe('services');
  });
});

describe('moveItem — cycle prevention', () => {
  it('refuses to move a node into itself', () => {
    const tree = sampleTree();
    expect(moveItem(tree, 'services', 'services', 0)).toBe(tree);
  });

  it('refuses to move a node into its own descendant', () => {
    const tree = sampleTree();
    expect(moveItem(tree, 'services', 'web-design', 0)).toBe(tree);
  });

  it('leaves the tree unchanged when the active id does not exist', () => {
    const tree = sampleTree();
    expect(moveItem(tree, 'missing', null, 0)).toBe(tree);
  });
});

describe('flattenForParentOptions', () => {
  it('lists every item with its depth', () => {
    const options = flattenForParentOptions(sampleTree());
    expect(options).toContainEqual({ id: 'web-design', label: 'Web Design', depth: 1 });
    expect(options).toContainEqual({ id: 'home', label: 'Home', depth: 0 });
  });

  it('excludes the given ids (self + descendants) so a node cannot become its own parent', () => {
    const services = sampleTree()[2];
    const options = flattenForParentOptions(sampleTree(), getSubtreeIds(services));
    expect(options.map((o) => o.id)).not.toContain('services');
    expect(options.map((o) => o.id)).not.toContain('web-design');
    expect(options.map((o) => o.id)).toEqual(['home', 'about', 'contact']);
  });
});

describe('toReorderPayload', () => {
  it('flattens the whole tree into {id, parentId, sortOrder} matching ReorderMenuItemsDto', () => {
    const payload = toReorderPayload(sampleTree());
    expect(payload.items).toEqual([
      { id: 'home', parentId: null, sortOrder: 0 },
      { id: 'about', parentId: null, sortOrder: 1 },
      { id: 'services', parentId: null, sortOrder: 2 },
      { id: 'web-design', parentId: 'services', sortOrder: 0 },
      { id: 'development', parentId: 'services', sortOrder: 1 },
      { id: 'marketing', parentId: 'services', sortOrder: 2 },
      { id: 'contact', parentId: null, sortOrder: 3 },
    ]);
  });
});
