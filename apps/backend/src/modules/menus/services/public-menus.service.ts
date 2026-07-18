import { Injectable } from '@nestjs/common';
import { MenuItem } from '@prisma/client';
import { MenusRepository, MenuWithItems } from '../repositories/menus.repository';
import { MenusMapper, type MenuTargetSlugLookup } from '../mappers/menus.mapper';
import { PublicMenuResponseDto } from '../dto/public-menu-response.dto';
import { MenuNotFoundException } from '../exceptions/menu.exceptions';

/**
 * Public read path (Backend Milestones 11.3–11.4) — deliberately a
 * separate injectable from `MenusService`, not extra methods bolted onto
 * it. Two reasons: (1) it never needs `MenusValidator`/
 * `AuditLoggerService` (no writes happen here), and (2) isolating it to
 * its own class gives a future caching layer one narrow injectable to
 * wrap without touching admin CRUD. Reuses `MenusRepository`/
 * `MenusMapper` rather than duplicating queries or response-building
 * logic.
 */
@Injectable()
export class PublicMenusService {
  constructor(
    private readonly repository: MenusRepository,
    private readonly mapper: MenusMapper
  ) {}

  /**
   * Cache-readiness seam (Backend Milestone 11.4 §4) — every public read
   * goes through this one method, which today just calls `resolver()`
   * directly (no cache implemented, behavior unchanged from Milestone
   * 11.3). It exists so a future cache (in-memory TTL map, HTTP
   * `Cache-Control`, or Redis) has exactly one call site to wrap —
   * `getMenuByLocation`/`getMenuBySlug` below would gain zero new lines
   * beyond passing a cache key.
   *
   * Recommended future cache keys (documented, not implemented):
   *   `menu:{siteId}:{location}` — for `getMenuByLocation`
   *   `menu:{siteId}:{slug}`     — for `getMenuBySlug`
   * Both should be invalidated on any `MenusService` write scoped to that
   * `menu.id` (create/update/delete/restore/item create/update/delete/
   * reorder) — a future cache implementation is the right place to wire
   * that invalidation, not this milestone.
   */
  private async withCache<T>(_cacheKey: string, resolver: () => Promise<T>): Promise<T> {
    return resolver();
  }

  private buildLocationCacheKey(siteId: string, location: string): string {
    return `menu:${siteId}:${location}`;
  }

  private buildSlugCacheKey(siteId: string, slug: string): string {
    return `menu:${siteId}:${slug}`;
  }

  /** Batch-fetches the slug of every distinct PAGE/ARTICLE/CATEGORY target
   * referenced by the menu's items — one query per target type (not one
   * per item), closing the same N+1 shape
   * `CategoriesRepository.countActiveChildrenForCategories` already
   * documents fixing for its own list-shaped call sites. */
  private async resolveTargetSlugs(
    items: MenuItem[],
    siteId: string
  ): Promise<MenuTargetSlugLookup> {
    const pageIds = [
      ...new Set(items.filter((i) => i.targetType === 'PAGE' && i.pageId).map((i) => i.pageId!)),
    ];
    const articleIds = [
      ...new Set(
        items.filter((i) => i.targetType === 'ARTICLE' && i.articleId).map((i) => i.articleId!)
      ),
    ];
    const categoryIds = [
      ...new Set(
        items.filter((i) => i.targetType === 'CATEGORY' && i.categoryId).map((i) => i.categoryId!)
      ),
    ];

    const [pages, articles, categories] = await Promise.all([
      this.repository.findPagesByIds(pageIds, siteId),
      this.repository.findArticlesByIds(articleIds, siteId),
      this.repository.findCategoriesByIds(categoryIds, siteId),
    ]);

    return {
      pages: new Map(pages.map((p) => [p.id, p.slug])),
      articles: new Map(articles.map((a) => [a.id, a.slug])),
      categories: new Map(categories.map((c) => [c.id, c.slug])),
    };
  }

  private async toPublicDto(menu: MenuWithItems, siteId: string): Promise<PublicMenuResponseDto> {
    const slugs = await this.resolveTargetSlugs(menu.items, siteId);
    return this.mapper.toPublicResponseDto(menu, slugs);
  }

  async getMenuByLocation(location: string): Promise<PublicMenuResponseDto> {
    const site = await this.repository.getDefaultSite();
    return this.withCache(this.buildLocationCacheKey(site.id, location), async () => {
      const menu = await this.repository.findPublishedByLocation(location, site.id);
      if (!menu) {
        throw new MenuNotFoundException(location);
      }
      return this.toPublicDto(menu, site.id);
    });
  }

  async getMenuBySlug(slug: string): Promise<PublicMenuResponseDto> {
    const site = await this.repository.getDefaultSite();
    return this.withCache(this.buildSlugCacheKey(site.id, slug), async () => {
      const menu = await this.repository.findPublishedBySlug(slug, site.id);
      if (!menu) {
        throw new MenuNotFoundException(slug);
      }
      return this.toPublicDto(menu, site.id);
    });
  }
}
