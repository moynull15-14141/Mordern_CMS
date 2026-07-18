import { Injectable } from '@nestjs/common';
import { MenuItem, MenuStatus, Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { MenusRepository, MenuWithItems } from '../repositories/menus.repository';
import { MenusValidator } from '../validators/menus.validator';
import { MenusMapper } from '../mappers/menus.mapper';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/menu.constants';
import { MenuQueryOptions } from '../interfaces/menu-query.interface';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { UpdateMenuItemDto } from '../dto/update-menu-item.dto';
import { ReorderMenuItemsDto } from '../dto/reorder-menu-items.dto';
import { MenuResponseDto } from '../dto/menu-response.dto';
import { MenuItemResponseDto } from '../dto/menu-item-response.dto';
import {
  CircularMenuItemParentException,
  MenuAlreadyDeletedException,
  MenuItemInUseException,
  MenuItemNotFoundException,
  MenuItemParentSiteMismatchException,
  MenuItemTargetNotFoundException,
  MenuLocationConflictException,
  MenuNotDeletedException,
  MenuNotFoundException,
  MenuSlugConflictException,
  ParentMenuItemNotFoundException,
  SelfParentMenuItemException,
} from '../exceptions/menu.exceptions';

interface ActingUser {
  id: string;
}

/**
 * Menus backend module (Backend Milestone 11.2). Mirrors `PagesService`'s
 * shape for the Menu shell, plus item-tree operations mirroring
 * `CategoriesService.moveCategory`'s circular-reference guard. See
 * docs/71_BACKEND_MENUS.md.
 */
@Injectable()
export class MenusService {
  constructor(
    private readonly repository: MenusRepository,
    private readonly validator: MenusValidator,
    private readonly mapper: MenusMapper,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getMenuOrThrow(id: string, includeDeleted = false): Promise<MenuWithItems> {
    const menu = await this.repository.findById(id, includeDeleted);
    if (!menu) {
      throw new MenuNotFoundException(id);
    }
    return menu;
  }

  private async getMenuItemOrThrow(menuId: string, itemId: string): Promise<MenuItem> {
    const item = await this.repository.findItemById(itemId);
    if (!item || item.menuId !== menuId) {
      throw new MenuItemNotFoundException(itemId);
    }
    return item;
  }

  private async resolveUniqueSlug(
    requestedSlug: string | undefined,
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<string> {
    const isTaken = async (candidate: string) =>
      Boolean(await this.repository.findBySlug(candidate, siteId, excludeId));

    if (requestedSlug) {
      const normalized = normalizeSlug(requestedSlug);
      this.validator.validateSlugShape(normalized);
      if (await isTaken(normalized)) {
        throw new MenuSlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(name);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  /** Backend Milestone 11.4 — `(siteId, location)` uniqueness, checked
   * only when `location` is a non-empty value (many menus with no
   * placement is fine; two menus both claiming "header" is not).
   * Mirrors `resolveUniqueSlug`'s conflict-check shape exactly, minus the
   * auto-generate branch (`location` is always optional/manual, never
   * derived from `name`). */
  private async assertLocationAvailable(
    location: string | undefined,
    siteId: string,
    excludeId?: string
  ): Promise<void> {
    if (!location) return;
    const existing = await this.repository.findByLocation(location, siteId, excludeId);
    if (existing) {
      throw new MenuLocationConflictException(location);
    }
  }

  /** Confirms the referenced Page/Article/Category exists and belongs to
   * the same site as the menu — same ownership check
   * `ArticlesService.validateReferences` performs for `primaryCategoryId`/
   * `tagIds`, applied to a menu item's single target instead. */
  private async validateTargetExists(
    fields: { targetType: string; pageId?: string; articleId?: string; categoryId?: string },
    siteId: string
  ): Promise<void> {
    if (fields.targetType === 'PAGE' && fields.pageId) {
      const page = await this.repository.findPageById(fields.pageId);
      if (!page || page.siteId !== siteId) {
        throw new MenuItemTargetNotFoundException('Page', fields.pageId);
      }
    }
    if (fields.targetType === 'ARTICLE' && fields.articleId) {
      const article = await this.repository.findArticleById(fields.articleId);
      if (!article || article.siteId !== siteId) {
        throw new MenuItemTargetNotFoundException('Article', fields.articleId);
      }
    }
    if (fields.targetType === 'CATEGORY' && fields.categoryId) {
      const category = await this.repository.findCategoryById(fields.categoryId);
      if (!category || category.siteId !== siteId) {
        throw new MenuItemTargetNotFoundException('Category', fields.categoryId);
      }
    }
  }

  /** Parent must exist, belong to the same menu, not be the item itself,
   * and not create a cycle — mirrors `CategoriesService.moveCategory`'s
   * three-step guard exactly. */
  private async validateParent(menuId: string, parentId: string, itemId?: string): Promise<void> {
    if (itemId && this.validator.assertNotSelfParent(itemId, parentId)) {
      throw new SelfParentMenuItemException(itemId);
    }
    const parent = await this.repository.findItemById(parentId);
    if (!parent) {
      throw new ParentMenuItemNotFoundException(parentId);
    }
    if (parent.menuId !== menuId) {
      throw new MenuItemParentSiteMismatchException(parentId);
    }
    if (itemId) {
      const allItems = await this.repository.findItemsByMenuId(menuId);
      if (this.validator.assertNoCircularReference(allItems, itemId, parentId)) {
        throw new CircularMenuItemParentException(itemId, parentId);
      }
    }
  }

  async createMenu(dto: CreateMenuDto, actor: ActingUser): Promise<MenuResponseDto> {
    const site = await this.repository.getDefaultSite();
    const slug = await this.resolveUniqueSlug(dto.slug, dto.name, site.id);
    await this.assertLocationAvailable(dto.location, site.id);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      name: dto.name,
      slug,
      location: dto.location,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.create',
      resource: 'menu',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(created);
  }

  async getMenu(id: string): Promise<MenuResponseDto> {
    return this.mapper.toResponseDto(await this.getMenuOrThrow(id));
  }

  async getMenuBySlug(slug: string): Promise<MenuResponseDto> {
    const site = await this.repository.getDefaultSite();
    const menu = await this.repository.findBySlugWithItems(slug, site.id);
    if (!menu) {
      throw new MenuNotFoundException(slug);
    }
    return this.mapper.toResponseDto(menu);
  }

  async listMenus(options: MenuQueryOptions): Promise<PaginatedResult<MenuResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toResponseDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updateMenu(id: string, dto: UpdateMenuDto, actor: ActingUser): Promise<MenuResponseDto> {
    const existing = await this.getMenuOrThrow(id);
    const site = await this.repository.getDefaultSite();
    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.name ?? existing.name, site.id, id)
        : undefined;

    if (dto.location !== undefined && dto.location !== existing.location) {
      await this.assertLocationAvailable(dto.location, site.id, id);
    }

    const updated = await this.repository.update(id, {
      name: dto.name,
      slug,
      location: dto.location,
      status: dto.status as MenuStatus | undefined,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.update',
      resource: 'menu',
      resourceId: id,
      result: 'success',
    });

    return this.mapper.toResponseDto(updated);
  }

  async deleteMenu(id: string, actor: ActingUser): Promise<MenuResponseDto> {
    const existing = await this.getMenuOrThrow(id);
    if (existing.deletedAt) {
      throw new MenuAlreadyDeletedException(id);
    }
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.delete',
      resource: 'menu',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getMenuOrThrow(id, true));
  }

  async restoreMenu(id: string, actor: ActingUser): Promise<MenuResponseDto> {
    const existing = await this.getMenuOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new MenuNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.restore',
      resource: 'menu',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getMenuOrThrow(id));
  }

  // --- Menu Items ---

  async createMenuItem(
    menuId: string,
    dto: CreateMenuItemDto,
    actor: ActingUser
  ): Promise<MenuItemResponseDto> {
    const menu = await this.getMenuOrThrow(menuId);
    this.validator.validateItemTarget(dto);
    await this.validateTargetExists(dto, menu.siteId);
    if (dto.parentId) {
      await this.validateParent(menuId, dto.parentId);
    }

    const sortOrder =
      dto.sortOrder ??
      (await this.repository.findItemsByMenuId(menuId)).filter(
        (i) => i.parentId === (dto.parentId ?? null)
      ).length;

    const created = await this.repository.createItem({
      menu: { connect: { id: menuId } },
      parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      label: dto.label,
      targetType: dto.targetType,
      page: dto.pageId ? { connect: { id: dto.pageId } } : undefined,
      article: dto.articleId ? { connect: { id: dto.articleId } } : undefined,
      category: dto.categoryId ? { connect: { id: dto.categoryId } } : undefined,
      url: dto.url,
      openMode: dto.openMode,
      icon: dto.icon,
      cssClass: dto.cssClass,
      sortOrder,
      layoutMeta: dto.layoutMeta as Prisma.InputJsonValue | undefined,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.item.create',
      resource: 'menu_item',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toItemResponseDto(created);
  }

  async updateMenuItem(
    menuId: string,
    itemId: string,
    dto: UpdateMenuItemDto,
    actor: ActingUser
  ): Promise<MenuItemResponseDto> {
    const menu = await this.getMenuOrThrow(menuId);
    const existing = await this.getMenuItemOrThrow(menuId, itemId);

    const targetType = dto.targetType ?? existing.targetType;
    const targetFieldsProvided =
      dto.pageId !== undefined ||
      dto.articleId !== undefined ||
      dto.categoryId !== undefined ||
      dto.url !== undefined;
    if (dto.targetType || targetFieldsProvided) {
      this.validator.validateItemTarget({
        targetType,
        pageId: dto.pageId ?? (targetType === 'PAGE' ? (existing.pageId ?? undefined) : undefined),
        articleId:
          dto.articleId ??
          (targetType === 'ARTICLE' ? (existing.articleId ?? undefined) : undefined),
        categoryId:
          dto.categoryId ??
          (targetType === 'CATEGORY' ? (existing.categoryId ?? undefined) : undefined),
        url:
          dto.url ??
          (targetType === 'EXTERNAL_URL' || targetType === 'CUSTOM_URL'
            ? (existing.url ?? undefined)
            : undefined),
      });
      await this.validateTargetExists(
        { targetType, pageId: dto.pageId, articleId: dto.articleId, categoryId: dto.categoryId },
        menu.siteId
      );
    }

    if (dto.parentId !== undefined) {
      await this.validateParent(menuId, dto.parentId, itemId);
    }

    const updated = await this.repository.updateItem(itemId, {
      label: dto.label,
      targetType: dto.targetType,
      page:
        dto.pageId !== undefined
          ? dto.pageId
            ? { connect: { id: dto.pageId } }
            : { disconnect: true }
          : undefined,
      article:
        dto.articleId !== undefined
          ? dto.articleId
            ? { connect: { id: dto.articleId } }
            : { disconnect: true }
          : undefined,
      category:
        dto.categoryId !== undefined
          ? dto.categoryId
            ? { connect: { id: dto.categoryId } }
            : { disconnect: true }
          : undefined,
      url: dto.url,
      openMode: dto.openMode,
      icon: dto.icon,
      cssClass: dto.cssClass,
      parent: dto.parentId !== undefined ? { connect: { id: dto.parentId } } : undefined,
      sortOrder: dto.sortOrder,
      layoutMeta: dto.layoutMeta as Prisma.InputJsonValue | undefined,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.item.update',
      resource: 'menu_item',
      resourceId: itemId,
      result: 'success',
    });

    return this.mapper.toItemResponseDto(updated);
  }

  async deleteMenuItem(
    menuId: string,
    itemId: string,
    actor: ActingUser
  ): Promise<MenuItemResponseDto> {
    await this.getMenuOrThrow(menuId);
    await this.getMenuItemOrThrow(menuId, itemId);

    const childrenCount = await this.repository.countActiveChildren(itemId);
    if (childrenCount > 0) {
      throw new MenuItemInUseException(itemId);
    }

    const deleted = await this.repository.softDeleteItem(itemId, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.item.delete',
      resource: 'menu_item',
      resourceId: itemId,
      result: 'success',
    });
    return this.mapper.toItemResponseDto(deleted);
  }

  /** Validates every entry before writing any of them — a partial reorder
   * can never be persisted (see `MenusRepository.reorderItems`). */
  async reorderMenuItems(
    menuId: string,
    dto: ReorderMenuItemsDto,
    actor: ActingUser
  ): Promise<void> {
    await this.getMenuOrThrow(menuId);
    const allItems = await this.repository.findItemsByMenuId(menuId);
    const allIds = new Set(allItems.map((i) => i.id));

    for (const entry of dto.items) {
      if (!allIds.has(entry.id)) {
        throw new MenuItemNotFoundException(entry.id);
      }
      if (entry.parentId) {
        if (this.validator.assertNotSelfParent(entry.id, entry.parentId)) {
          throw new SelfParentMenuItemException(entry.id);
        }
        if (!allIds.has(entry.parentId)) {
          throw new ParentMenuItemNotFoundException(entry.parentId);
        }
        if (this.validator.assertNoCircularReference(allItems, entry.id, entry.parentId)) {
          throw new CircularMenuItemParentException(entry.id, entry.parentId);
        }
      }
    }

    await this.repository.reorderItems(
      dto.items.map((entry) => ({
        id: entry.id,
        parentId: entry.parentId ?? null,
        sortOrder: entry.sortOrder,
      }))
    );

    this.auditLogger.record({
      actorId: actor.id,
      action: 'menu.items.reorder',
      resource: 'menu',
      resourceId: menuId,
      result: 'success',
    });
  }
}
