import { Category, CategoryStatus } from '@prisma/client';
import { CategoryTreeNode } from '../interfaces/category-tree-node.interface';
import { CategoriesMapper } from './categories.mapper';

function buildCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat-1',
    siteId: 'site-1',
    parentId: null,
    name: 'News',
    slug: 'news',
    description: null,
    status: CategoryStatus.ACTIVE,
    seoMetaId: null,
    sortOrder: 1,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Category;
}

describe('CategoriesMapper', () => {
  const mapper = new CategoriesMapper();

  it('maps a category with no SEO to a response DTO', () => {
    const result = mapper.toResponseDto(buildCategory(), {
      articleCount: 3,
      childrenCount: 2,
      seoMeta: null,
    });
    expect(result.id).toBe('cat-1');
    expect(result.articleCount).toBe(3);
    expect(result.childrenCount).toBe(2);
    expect(result.seo).toBeNull();
    expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('maps SEO fields when present', () => {
    const result = mapper.toResponseDto(buildCategory(), {
      articleCount: 0,
      childrenCount: 0,
      seoMeta: {
        title: 'SEO Title',
        description: null,
        canonicalUrl: null,
        keywords: ['a'],
        openGraph: null,
        twitterCard: null,
        schemaJson: null,
        robots: null,
        extraMeta: null,
      } as never,
    });
    expect(result.seo).toEqual(expect.objectContaining({ title: 'SEO Title', keywords: ['a'] }));
  });

  it('maps a deleted category with a deletedAt timestamp', () => {
    const result = mapper.toResponseDto(buildCategory({ deletedAt: new Date('2026-02-01') }), {
      articleCount: 0,
      childrenCount: 0,
      seoMeta: null,
    });
    expect(result.deletedAt).toBe('2026-02-01T00:00:00.000Z');
  });

  it('toTreeNodeDto maps a leaf node with childrenCount 0', () => {
    const node: CategoryTreeNode = { ...buildCategory(), children: [] };
    const result = mapper.toTreeNodeDto(node);
    expect(result.childrenCount).toBe(0);
    expect(result.children).toEqual([]);
  });

  it('toTreeNodeDto maps nested children recursively', () => {
    const child: CategoryTreeNode = { ...buildCategory({ id: 'child-1' }), children: [] };
    const node: CategoryTreeNode = { ...buildCategory(), children: [child] };
    const result = mapper.toTreeNodeDto(node);
    expect(result.childrenCount).toBe(1);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].id).toBe('child-1');
  });
});
