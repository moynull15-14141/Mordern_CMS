import { MenuItemOpenMode, MenuItemTargetType, MenuStatus } from '@prisma/client';
import { MenusMapper, type MenuTargetSlugLookup } from './menus.mapper';
import type { MenuWithItems } from '../repositories/menus.repository';

function buildItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'item-1',
    menuId: 'menu-1',
    parentId: null,
    label: 'Home',
    targetType: MenuItemTargetType.PAGE,
    pageId: 'page-1',
    articleId: null,
    categoryId: null,
    url: null,
    openMode: MenuItemOpenMode.SELF,
    icon: null,
    cssClass: null,
    sortOrder: 0,
    layoutMeta: { column: 1 },
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

function buildMenu(items: ReturnType<typeof buildItem>[]): MenuWithItems {
  return {
    id: 'menu-1',
    siteId: 'site-1',
    name: 'Header',
    slug: 'header',
    location: 'header',
    status: MenuStatus.PUBLISHED,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    items,
  } as MenuWithItems;
}

/** Default fixture: `page-1` -> "about", `article-1` -> "seo-guide",
 * `cat-1` -> "travel" — matches the milestone brief's own examples. */
function buildSlugs(overrides: Partial<MenuTargetSlugLookup> = {}): MenuTargetSlugLookup {
  return {
    pages: new Map([['page-1', 'about']]),
    articles: new Map([['article-1', 'seo-guide']]),
    categories: new Map([['cat-1', 'travel']]),
    ...overrides,
  };
}

describe('MenusMapper', () => {
  describe('toResponseDto (admin)', () => {
    it('includes isBroken=true for an item whose target FK is null', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([buildItem({ targetType: 'PAGE', pageId: null })]);
      const dto = mapper.toResponseDto(menu);
      expect(dto.items[0].isBroken).toBe(true);
    });

    it('includes isBroken=false for a valid PAGE target', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([buildItem({ targetType: 'PAGE', pageId: 'page-1' })]);
      const dto = mapper.toResponseDto(menu);
      expect(dto.items[0].isBroken).toBe(false);
    });

    it('exposes internal ids and audit-adjacent fields', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([buildItem()]);
      const dto = mapper.toResponseDto(menu);
      expect(dto.items[0]).toMatchObject({ pageId: 'page-1', layoutMeta: { column: 1 } });
    });
  });

  describe('toPublicResponseDto (public — Backend Milestones 11.3–11.4)', () => {
    it('excludes an item whose target FK is null (broken)', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([buildItem({ targetType: 'PAGE', pageId: null })]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items).toHaveLength(0);
    });

    it('excludes an item whose FK is set but the slug lookup has no match', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([buildItem({ targetType: 'PAGE', pageId: 'missing-page' })]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items).toHaveLength(0);
    });

    it('includes a valid item and resolves its URL from the slug lookup', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([buildItem({ targetType: 'PAGE', pageId: 'page-1' })]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items).toHaveLength(1);
      expect(dto.items[0]).toMatchObject({
        label: 'Home',
        resolvedUrl: '/about',
        isExternal: false,
        targetSlug: 'about',
      });
    });

    it('resolves an ARTICLE target to /blog/{slug}', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([
        buildItem({ targetType: 'ARTICLE', pageId: null, articleId: 'article-1' }),
      ]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items[0].resolvedUrl).toBe('/blog/seo-guide');
    });

    it('resolves a CATEGORY target to /category/{slug}', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([
        buildItem({ targetType: 'CATEGORY', pageId: null, categoryId: 'cat-1' }),
      ]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items[0].resolvedUrl).toBe('/category/travel');
    });

    it('resolves EXTERNAL_URL/CUSTOM_URL targets to their raw url, with isExternal=true', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([
        buildItem({ targetType: 'EXTERNAL_URL', pageId: null, url: 'https://example.com' }),
      ]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items[0]).toMatchObject({
        resolvedUrl: 'https://example.com',
        isExternal: true,
        targetSlug: null,
      });
    });

    it('never exposes internal ids, layoutMeta, sortOrder, parentId, or audit fields', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([buildItem()]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      const item = dto.items[0] as unknown as Record<string, unknown>;
      expect(item).not.toHaveProperty('pageId');
      expect(item).not.toHaveProperty('articleId');
      expect(item).not.toHaveProperty('categoryId');
      expect(item).not.toHaveProperty('layoutMeta');
      expect(item).not.toHaveProperty('sortOrder');
      expect(item).not.toHaveProperty('parentId');
      expect(item).not.toHaveProperty('createdAt');
      expect(item).not.toHaveProperty('updatedAt');
      expect(item).not.toHaveProperty('isBroken');
    });

    it('never exposes menu status or deletedAt', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs()) as unknown as Record<
        string,
        unknown
      >;
      expect(dto).not.toHaveProperty('status');
      expect(dto).not.toHaveProperty('deletedAt');
      expect(dto).not.toHaveProperty('createdAt');
    });

    it('builds a nested tree and still excludes only the unresolvable node, keeping valid siblings/children', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([
        buildItem({ id: 'a', parentId: null, targetType: 'PAGE', pageId: 'page-1' }),
        buildItem({ id: 'b', parentId: 'a', targetType: 'PAGE', pageId: null }), // broken child
        buildItem({
          id: 'c',
          parentId: 'a',
          targetType: 'EXTERNAL_URL',
          pageId: null,
          url: 'https://x.com',
        }),
      ]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items).toHaveLength(1);
      expect(dto.items[0].id).toBe('a');
      expect(dto.items[0].children.map((c) => c.id)).toEqual(['c']);
    });

    it('excludes an unresolvable root item entirely (not just unresolvable children)', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([
        buildItem({ id: 'a', targetType: 'ARTICLE', pageId: null, articleId: null }),
        buildItem({ id: 'b', targetType: 'CATEGORY', pageId: null, categoryId: 'cat-1' }),
      ]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items.map((i) => i.id)).toEqual(['b']);
    });

    it('passes through openMode/icon/cssClass unchanged', () => {
      const mapper = new MenusMapper();
      const menu = buildMenu([
        buildItem({ openMode: 'BLANK', icon: 'home', cssClass: 'nav-home' }),
      ]);
      const dto = mapper.toPublicResponseDto(menu, buildSlugs());
      expect(dto.items[0]).toMatchObject({ openMode: 'BLANK', icon: 'home', cssClass: 'nav-home' });
    });

    it('returns an empty items array for a menu with no items', () => {
      const mapper = new MenusMapper();
      const dto = mapper.toPublicResponseDto(buildMenu([]), buildSlugs());
      expect(dto.items).toEqual([]);
    });
  });
});
