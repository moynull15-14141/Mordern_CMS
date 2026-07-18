import { Injectable } from '@nestjs/common';
import { MenuItem } from '@prisma/client';
import { MenuWithItems } from '../repositories/menus.repository';
import { MenuResponseDto } from '../dto/menu-response.dto';
import { MenuItemResponseDto, MenuItemTreeNodeResponseDto } from '../dto/menu-item-response.dto';
import { PublicMenuResponseDto } from '../dto/public-menu-response.dto';
import { PublicMenuItemTreeNodeResponseDto } from '../dto/public-menu-item-response.dto';
import { buildMenuItemTree, type MenuItemTreeNode } from '../utils/menu-item-tree.util';
import {
  resolveArticleUrl,
  resolveCategoryUrl,
  resolvePageUrl,
} from '../constants/menu-url.constants';

/** Slug lookup tables the caller (`PublicMenusService`) batch-fetches once
 * per menu (one query per target type, not one per item — see
 * `MenusRepository.findPagesByIds`/`findArticlesByIds`/
 * `findCategoriesByIds`) and passes in, so the mapper stays a pure
 * function with no DB access of its own. */
export interface MenuTargetSlugLookup {
  pages: Map<string, string>;
  articles: Map<string, string>;
  categories: Map<string, string>;
}

interface PublicItemNode {
  id: string;
  parentId: string | null;
  sortOrder: number;
  label: string;
  targetType: MenuItem['targetType'];
  url: string | null;
  resolvedUrl: string;
  isExternal: boolean;
  targetSlug: string | null;
  openMode: MenuItem['openMode'];
  icon: string | null;
  cssClass: string | null;
}

@Injectable()
export class MenusMapper {
  private isItemBroken(item: MenuItem): boolean {
    return (
      (item.targetType === 'PAGE' && !item.pageId) ||
      (item.targetType === 'ARTICLE' && !item.articleId) ||
      (item.targetType === 'CATEGORY' && !item.categoryId)
    );
  }

  private toItemDto(item: MenuItem): MenuItemResponseDto {
    const isBroken = this.isItemBroken(item);

    return {
      id: item.id,
      parentId: item.parentId,
      label: item.label,
      targetType: item.targetType,
      pageId: item.pageId,
      articleId: item.articleId,
      categoryId: item.categoryId,
      url: item.url,
      openMode: item.openMode,
      icon: item.icon,
      cssClass: item.cssClass,
      sortOrder: item.sortOrder,
      layoutMeta: item.layoutMeta as Record<string, unknown> | null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      isBroken,
    };
  }

  /** Builds the nested tree from the menu's flat, non-deleted item list —
   * mirrors `CategoriesMapper.toTreeNodeDto`'s reliance on
   * `buildTree`/`buildCategoryTree`, using `buildMenuItemTree` for the
   * shape difference (`label`, no `slug`). */
  toResponseDto(menu: MenuWithItems): MenuResponseDto {
    const tree = buildMenuItemTree(menu.items.map((item) => this.toItemDto(item)));

    return {
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      location: menu.location,
      status: menu.status,
      items: tree as MenuItemTreeNodeResponseDto[],
      createdAt: menu.createdAt.toISOString(),
      updatedAt: menu.updatedAt.toISOString(),
      deletedAt: menu.deletedAt?.toISOString() ?? null,
    };
  }

  toItemResponseDto(item: MenuItem): MenuItemResponseDto {
    return this.toItemDto(item);
  }

  /** Resolves one item's target into `{resolvedUrl, isExternal,
   * targetSlug}`, or returns `null` when it can't be resolved (broken FK,
   * or the FK is set but the target's slug wasn't in the batch-fetched
   * lookup — e.g. it belongs to a different site, which shouldn't happen
   * given `MenusService.validateTargetExists`'s own site check on write,
   * but the read path re-verifies rather than trusting write-time
   * validation forever holds). An unresolvable item is excluded from the
   * public response entirely (Backend Milestone 11.4 §1), never returned
   * with a null `resolvedUrl` — the whole point of this field is that a
   * consumer never has to null-check it. */
  private resolveTarget(
    item: MenuItem,
    slugs: MenuTargetSlugLookup
  ): { resolvedUrl: string; isExternal: boolean; targetSlug: string | null } | null {
    switch (item.targetType) {
      case 'PAGE': {
        const slug = item.pageId ? slugs.pages.get(item.pageId) : undefined;
        return slug
          ? { resolvedUrl: resolvePageUrl(slug), isExternal: false, targetSlug: slug }
          : null;
      }
      case 'ARTICLE': {
        const slug = item.articleId ? slugs.articles.get(item.articleId) : undefined;
        return slug
          ? { resolvedUrl: resolveArticleUrl(slug), isExternal: false, targetSlug: slug }
          : null;
      }
      case 'CATEGORY': {
        const slug = item.categoryId ? slugs.categories.get(item.categoryId) : undefined;
        return slug
          ? { resolvedUrl: resolveCategoryUrl(slug), isExternal: false, targetSlug: slug }
          : null;
      }
      case 'EXTERNAL_URL':
      case 'CUSTOM_URL':
        return item.url ? { resolvedUrl: item.url, isExternal: true, targetSlug: null } : null;
      default:
        return null;
    }
  }

  /** Public read path (Backend Milestones 11.3–11.4) — excludes any item
   * that can't be resolved to a real URL (broken FK, or an internal
   * target whose slug wasn't found) entirely (never a flag, unlike the
   * admin `isBroken` field) and strips every internal field (ids, audit,
   * layoutMeta, parentId/sortOrder) from the final response. Reuses
   * `buildMenuItemTree` the same way `toResponseDto` does; the
   * `parentId`/`sortOrder` the tree builder needs are stripped in a
   * second pass rather than never included, since the algorithm requires
   * them to group/sort correctly. */
  toPublicResponseDto(menu: MenuWithItems, slugs: MenuTargetSlugLookup): PublicMenuResponseDto {
    const nodes: PublicItemNode[] = [];
    for (const item of menu.items) {
      const resolved = this.resolveTarget(item, slugs);
      if (!resolved) continue;
      nodes.push({
        id: item.id,
        parentId: item.parentId,
        sortOrder: item.sortOrder,
        label: item.label,
        targetType: item.targetType,
        url: item.url,
        resolvedUrl: resolved.resolvedUrl,
        isExternal: resolved.isExternal,
        targetSlug: resolved.targetSlug,
        openMode: item.openMode,
        icon: item.icon,
        cssClass: item.cssClass,
      });
    }

    const tree = buildMenuItemTree(nodes);

    return {
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      location: menu.location,
      items: tree.map((node) => this.stripInternalTreeFields(node)),
    };
  }

  private stripInternalTreeFields(
    node: MenuItemTreeNode<PublicItemNode>
  ): PublicMenuItemTreeNodeResponseDto {
    return {
      id: node.id,
      label: node.label,
      targetType: node.targetType,
      url: node.url,
      resolvedUrl: node.resolvedUrl,
      isExternal: node.isExternal,
      targetSlug: node.targetSlug,
      openMode: node.openMode,
      icon: node.icon,
      cssClass: node.cssClass,
      children: node.children.map((child) => this.stripInternalTreeFields(child)),
    };
  }
}
