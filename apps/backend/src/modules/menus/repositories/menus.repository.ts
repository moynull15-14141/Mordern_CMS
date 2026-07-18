import { Injectable } from '@nestjs/common';
import { Menu, MenuItem, Prisma, Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MenuQueryOptions } from '../interfaces/menu-query.interface';
import { MenuSortField } from '../constants/menu.constants';

const SORT_FIELD_MAP: Record<MenuSortField, string> = {
  [MenuSortField.NAME]: 'name',
  [MenuSortField.CREATED_AT]: 'createdAt',
  [MenuSortField.UPDATED_AT]: 'updatedAt',
  [MenuSortField.STATUS]: 'status',
};

/** Only non-deleted items — a soft-deleted item's descendants are excluded
 * too (a client never has to filter deleted rows out of a tree response;
 * see `MenusService.deleteMenuItem`'s active-children guard, which
 * prevents a deleted item from ever having non-deleted children in the
 * first place). */
const MENU_INCLUDE = {
  items: { where: { deletedAt: null } },
} satisfies Prisma.MenuInclude;

export type MenuWithItems = Prisma.MenuGetPayload<{ include: typeof MENU_INCLUDE }>;

/**
 * Full CRUD for `Menu` + `MenuItem`, mirroring `PagesRepository`'s shape.
 * See docs/71_BACKEND_MENUS.md.
 */
@Injectable()
export class MenusRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.MenuWhereInput {
    return { deletedAt: null };
  }

  async getDefaultSite(): Promise<Site> {
    const site = await this.prisma.site.findFirst({ where: { deletedAt: null } });
    if (!site) {
      throw new Error(
        'No active Site exists — the platform must be seeded with at least one Site.'
      );
    }
    return site;
  }

  async findById(id: string, includeDeleted = false): Promise<MenuWithItems | null> {
    return this.prisma.menu.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
      include: MENU_INCLUDE,
    });
  }

  async findBySlug(slug: string, siteId: string, excludeId?: string): Promise<Menu | null> {
    return this.prisma.menu.findFirst({
      where: { slug, siteId, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  }

  async findBySlugWithItems(slug: string, siteId: string): Promise<MenuWithItems | null> {
    return this.prisma.menu.findFirst({
      where: { slug, siteId, deletedAt: null },
      include: MENU_INCLUDE,
    });
  }

  /** Public read path (Backend Milestone 11.3) — additionally requires
   * `status: PUBLISHED`, unlike the admin `findBySlugWithItems`/`findById`
   * (which intentionally show DRAFT/ARCHIVED menus to an authenticated
   * `menu.manage` user). Single query via `MENU_INCLUDE` — no separate
   * item fetch, no N+1. */
  async findPublishedBySlug(slug: string, siteId: string): Promise<MenuWithItems | null> {
    return this.prisma.menu.findFirst({
      where: { slug, siteId, deletedAt: null, status: 'PUBLISHED' },
      include: MENU_INCLUDE,
    });
  }

  /** No uniqueness constraint on `location` — if more than one PUBLISHED
   * menu shares a location, the first match (site's default `findFirst`
   * ordering) wins. Documented as a known limitation rather than silently
   * picking an arbitrary tiebreak rule this milestone didn't ask for. */
  async findPublishedByLocation(location: string, siteId: string): Promise<MenuWithItems | null> {
    return this.prisma.menu.findFirst({
      where: { location, siteId, deletedAt: null, status: 'PUBLISHED' },
      include: MENU_INCLUDE,
    });
  }

  /** Backend Milestone 11.4 — location-uniqueness check. Mirrors
   * `findBySlug`'s exact shape (same exclude-self-on-update pattern);
   * only ever called when `location` is truthy — a `null`/omitted
   * location never needs a uniqueness check (many menus with no
   * placement is fine, same reasoning `Category.parentId` allows many
   * `null`s). */
  async findByLocation(location: string, siteId: string, excludeId?: string): Promise<Menu | null> {
    return this.prisma.menu.findFirst({
      where: {
        location,
        siteId,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  private buildWhere(siteId: string, options: MenuQueryOptions): Prisma.MenuWhereInput {
    const { filters } = options;
    const where: Prisma.MenuWhereInput = { siteId, deletedAt: null };

    if (filters.status) where.status = filters.status;
    if (filters.location) where.location = filters.location;
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }

  async findMany(
    siteId: string,
    options: MenuQueryOptions
  ): Promise<{ items: MenuWithItems[]; total: number }> {
    const where = this.buildWhere(siteId, options);
    const orderBy = { [SORT_FIELD_MAP[options.sortBy]]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.menu.findMany({
        where,
        orderBy,
        skip,
        take: options.limit,
        include: MENU_INCLUDE,
      }),
      this.prisma.menu.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: Prisma.MenuCreateInput): Promise<MenuWithItems> {
    return this.prisma.menu.create({ data, include: MENU_INCLUDE });
  }

  async update(id: string, data: Prisma.MenuUpdateInput): Promise<MenuWithItems> {
    return this.prisma.menu.update({ where: { id }, data, include: MENU_INCLUDE });
  }

  async softDelete(id: string, actorId: string | null): Promise<Menu> {
    return this.prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Menu> {
    return this.prisma.menu.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }

  // --- Menu Items ---

  async findItemById(id: string, includeDeleted = false): Promise<MenuItem | null> {
    return this.prisma.menuItem.findFirst({
      where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    });
  }

  async findItemsByMenuId(menuId: string): Promise<MenuItem[]> {
    return this.prisma.menuItem.findMany({ where: { menuId, deletedAt: null } });
  }

  async countActiveChildren(itemId: string): Promise<number> {
    return this.prisma.menuItem.count({ where: { parentId: itemId, deletedAt: null } });
  }

  async createItem(data: Prisma.MenuItemCreateInput): Promise<MenuItem> {
    return this.prisma.menuItem.create({ data });
  }

  async updateItem(id: string, data: Prisma.MenuItemUpdateInput): Promise<MenuItem> {
    return this.prisma.menuItem.update({ where: { id }, data });
  }

  async softDeleteItem(id: string, actorId: string | null): Promise<MenuItem> {
    return this.prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  /** Applies every entry's `parentId`/`sortOrder` inside one transaction —
   * a partial reorder can never be persisted (mirrors the atomicity
   * reasoning `ArticlesRepository.setTags` documents for its own
   * multi-row replace). */
  async reorderItems(
    updates: { id: string; parentId: string | null; sortOrder: number }[]
  ): Promise<void> {
    await this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.menuItem.update({
          where: { id: update.id },
          data: { parentId: update.parentId, sortOrder: update.sortOrder },
        })
      )
    );
  }

  // --- Cross-module target lookups (read-only, no FK ownership assumed
  // beyond existence + siteId match — same pattern
  // `ArticlesRepository.findCategoryById`/`findMediaAssetById` use). ---

  async findPageById(id: string): Promise<{ id: string; siteId: string } | null> {
    return this.prisma.page.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, siteId: true },
    });
  }

  async findArticleById(id: string): Promise<{ id: string; siteId: string } | null> {
    return this.prisma.article.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, siteId: true },
    });
  }

  async findCategoryById(id: string): Promise<{ id: string; siteId: string } | null> {
    return this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, siteId: true },
    });
  }

  // --- Batched slug lookups for the public URL resolver (Backend
  // Milestone 11.4) — one query per target type per menu, not one query
  // per item, closing the same N+1 shape
  // `CategoriesRepository.countActiveChildrenForCategories` already
  // documents fixing for its own list-shaped call sites. ---

  async findPagesByIds(ids: string[], siteId: string): Promise<{ id: string; slug: string }[]> {
    if (ids.length === 0) return [];
    return this.prisma.page.findMany({
      where: { id: { in: ids }, siteId, deletedAt: null },
      select: { id: true, slug: true },
    });
  }

  async findArticlesByIds(ids: string[], siteId: string): Promise<{ id: string; slug: string }[]> {
    if (ids.length === 0) return [];
    return this.prisma.article.findMany({
      where: { id: { in: ids }, siteId, deletedAt: null },
      select: { id: true, slug: true },
    });
  }

  async findCategoriesByIds(
    ids: string[],
    siteId: string
  ): Promise<{ id: string; slug: string }[]> {
    if (ids.length === 0) return [];
    return this.prisma.category.findMany({
      where: { id: { in: ids }, siteId, deletedAt: null },
      select: { id: true, slug: true },
    });
  }
}
