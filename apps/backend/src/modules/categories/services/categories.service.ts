import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { CategoriesRepository } from '../repositories/categories.repository';
import { SlugShapeValidator } from '../validators/slug-shape.validator';
import { CategoriesMapper } from '../mappers/categories.mapper';
import { TaxonomyPolicy } from '../policies/taxonomy.policy';
import {
  buildTree,
  getAncestors,
  getBreadcrumb,
  getChildren,
  getDescendants,
  wouldCreateCycle,
} from '../utils/category-tree.util';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/category.constants';
import { CategoryQueryOptions } from '../interfaces/category-query.interface';
import { CategoryBreadcrumbItem } from '../interfaces/category-tree-node.interface';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { MoveCategoryDto } from '../dto/move-category.dto';
import { CategoryResponseDto, CategoryTreeNodeResponseDto } from '../dto/category-response.dto';
import {
  CategoryAlreadyDeletedException,
  CategoryInUseException,
  CategoryNameConflictException,
  CategoryNotDeletedException,
  CategoryNotFoundException,
  CategorySlugConflictException,
  CircularParentException,
  ParentCategoryNotFoundException,
  SelfParentException,
} from '../exceptions/category.exceptions';

interface ActingUser {
  id: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    private readonly repository: CategoriesRepository,
    private readonly validator: SlugShapeValidator,
    private readonly mapper: CategoriesMapper,
    private readonly authorizationService: AuthorizationService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getCategoryOrThrow(id: string, includeDeleted = false) {
    const category = await this.repository.findById(id, includeDeleted);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return category;
  }

  private async assertCanManage(
    actor: ActingUser,
    siteId: string,
    action: 'create' | 'update' | 'delete'
  ): Promise<void> {
    const effectiveRoles = await this.authorizationService.resolveEffectiveRoles(actor.id);
    const policy = new TaxonomyPolicy();
    const subject = { siteId };
    const allowed =
      action === 'create'
        ? policy.canCreate(effectiveRoles)
        : action === 'update'
          ? policy.canUpdate(effectiveRoles, subject)
          : policy.canDelete(effectiveRoles, subject);
    if (!allowed) {
      throw new ForbiddenException(`You do not have permission to ${action} categories.`);
    }
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
        throw new CategorySlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(name);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  private async assertNameAvailable(
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<void> {
    const existing = await this.repository.findByName(name, siteId, excludeId);
    if (existing) {
      throw new CategoryNameConflictException(name);
    }
  }

  private async toResponseDto(
    category: Awaited<ReturnType<CategoriesRepository['findById']>>
  ): Promise<CategoryResponseDto> {
    if (!category) {
      throw new Error('toResponseDto called with a null category');
    }
    const [articleCount, childrenCount, seoMeta] = await Promise.all([
      this.repository.countArticlesUsingCategory(category.id),
      this.repository.countActiveChildren(category.id),
      category.seoMetaId
        ? this.repository.findSeoMetaById(category.seoMetaId)
        : Promise.resolve(null),
    ]);
    return this.mapper.toResponseDto(category, { articleCount, childrenCount, seoMeta });
  }

  /**
   * Batched sibling of `toResponseDto` for list-shaped results (stabilization
   * patch, post-Final-Backend-Audit — closes the N+1 pattern the audit
   * flagged: 3 queries per category via `Promise.all(items.map(toResponseDto))`
   * became 3 queries total, regardless of list size). Single-item call sites
   * (`getCategory`, `createCategory`, etc.) are unchanged and still use
   * `toResponseDto` above — this does not replace it, only the list paths.
   */
  private async toResponseDtos(
    categories: NonNullable<Awaited<ReturnType<CategoriesRepository['findById']>>>[]
  ): Promise<CategoryResponseDto[]> {
    if (categories.length === 0) return [];
    const ids = categories.map((c) => c.id);
    const seoMetaIds = categories.map((c) => c.seoMetaId).filter((id): id is string => id !== null);

    const [articleCounts, childrenCounts, seoMetaById] = await Promise.all([
      this.repository.countArticlesUsingCategories(ids),
      this.repository.countActiveChildrenForCategories(ids),
      this.repository.findSeoMetaByIds(seoMetaIds),
    ]);

    return categories.map((category) =>
      this.mapper.toResponseDto(category, {
        articleCount: articleCounts.get(category.id) ?? 0,
        childrenCount: childrenCounts.get(category.id) ?? 0,
        seoMeta: category.seoMetaId ? (seoMetaById.get(category.seoMetaId) ?? null) : null,
      })
    );
  }

  async createCategory(dto: CreateCategoryDto, actor: ActingUser): Promise<CategoryResponseDto> {
    const site = await this.repository.getDefaultSite();
    await this.assertCanManage(actor, site.id, 'create');

    if (dto.parentId) {
      const parent = await this.repository.findById(dto.parentId);
      if (!parent) throw new ParentCategoryNotFoundException(dto.parentId);
    }

    await this.assertNameAvailable(dto.name, site.id);
    const slug = await this.resolveUniqueSlug(dto.slug, dto.name, site.id);

    let seoMetaId: string | undefined;
    if (dto.seo) {
      seoMetaId = await this.repository.upsertSeoMeta(
        null,
        site.id,
        dto.seo as Prisma.SeoMetaCreateInput,
        actor.id
      );
    }

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      name: dto.name,
      slug,
      description: dto.description,
      sortOrder: dto.sortOrder,
      seoMeta: seoMetaId ? { connect: { id: seoMetaId } } : undefined,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'category.create',
      resource: 'category',
      resourceId: created.id,
      result: 'success',
    });
    return this.toResponseDto(created);
  }

  async getCategory(id: string): Promise<CategoryResponseDto> {
    const category = await this.getCategoryOrThrow(id);
    return this.toResponseDto(category);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const site = await this.repository.getDefaultSite();
    const category = await this.repository.findBySlug(slug, site.id);
    if (!category) throw new CategoryNotFoundException(slug);
    return this.toResponseDto(category);
  }

  async listCategories(
    options: CategoryQueryOptions
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    const mapped = await this.toResponseDtos(items);
    return buildPaginatedResult(mapped, options.page, options.limit, total);
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
    actor: ActingUser
  ): Promise<CategoryResponseDto> {
    const existing = await this.getCategoryOrThrow(id);
    await this.assertCanManage(actor, existing.siteId, 'update');

    if (dto.name && dto.name !== existing.name) {
      await this.assertNameAvailable(dto.name, existing.siteId, id);
    }

    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.name ?? existing.name, existing.siteId, id)
        : undefined;

    let seoMetaId: string | undefined;
    if (dto.seo) {
      seoMetaId = await this.repository.upsertSeoMeta(
        existing.seoMetaId,
        existing.siteId,
        dto.seo as Prisma.SeoMetaUpdateInput,
        actor.id
      );
    }

    const updated = await this.repository.update(id, {
      name: dto.name,
      slug,
      description: dto.description,
      status: dto.status,
      sortOrder: dto.sortOrder,
      seoMeta: seoMetaId ? { connect: { id: seoMetaId } } : undefined,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'category.update',
      resource: 'category',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async deleteCategory(id: string, actor: ActingUser): Promise<CategoryResponseDto> {
    const existing = await this.getCategoryOrThrow(id);
    if (existing.deletedAt) {
      throw new CategoryAlreadyDeletedException(id);
    }
    await this.assertCanManage(actor, existing.siteId, 'delete');

    const articleCount = await this.repository.countArticlesUsingCategory(id);
    if (articleCount > 0) {
      throw new CategoryInUseException(id, 'articles');
    }
    const childrenCount = await this.repository.countActiveChildren(id);
    if (childrenCount > 0) {
      throw new CategoryInUseException(id, 'children');
    }

    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'category.delete',
      resource: 'category',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getCategoryOrThrow(id, true));
  }

  async restoreCategory(id: string, actor: ActingUser): Promise<CategoryResponseDto> {
    const existing = await this.getCategoryOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new CategoryNotDeletedException(id);
    }
    await this.assertCanManage(actor, existing.siteId, 'update');
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'category.restore',
      resource: 'category',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getCategoryOrThrow(id));
  }

  async moveCategory(
    id: string,
    dto: MoveCategoryDto,
    actor: ActingUser
  ): Promise<CategoryResponseDto> {
    const existing = await this.getCategoryOrThrow(id);
    await this.assertCanManage(actor, existing.siteId, 'update');

    const newParentId = dto.parentId ?? null;

    if (newParentId) {
      if (newParentId === id) {
        throw new SelfParentException(id);
      }
      const parent = await this.repository.findById(newParentId);
      if (!parent) {
        throw new ParentCategoryNotFoundException(newParentId);
      }
      const allCategories = await this.repository.findAllForSite(existing.siteId);
      if (wouldCreateCycle(allCategories, id, newParentId)) {
        throw new CircularParentException(id, newParentId);
      }
    }

    const updated = await this.repository.update(id, {
      parent: newParentId ? { connect: { id: newParentId } } : { disconnect: true },
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'category.move',
      resource: 'category',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async getTree(): Promise<CategoryTreeNodeResponseDto[]> {
    const site = await this.repository.getDefaultSite();
    const categories = await this.repository.findAllForSite(site.id);
    const tree = buildTree(categories);
    return tree.map((node) => this.mapper.toTreeNodeDto(node));
  }

  async getFlat(): Promise<CategoryResponseDto[]> {
    const site = await this.repository.getDefaultSite();
    const categories = await this.repository.findAllForSite(site.id);
    return this.toResponseDtos(categories);
  }

  async getChildren(id: string): Promise<CategoryResponseDto[]> {
    const existing = await this.getCategoryOrThrow(id);
    const allCategories = await this.repository.findAllForSite(existing.siteId);
    const children = getChildren(allCategories, id);
    return this.toResponseDtos(children);
  }

  async getDescendants(id: string): Promise<CategoryResponseDto[]> {
    const existing = await this.getCategoryOrThrow(id);
    const allCategories = await this.repository.findAllForSite(existing.siteId);
    const descendants = getDescendants(allCategories, id);
    return this.toResponseDtos(descendants);
  }

  async getAncestors(id: string): Promise<CategoryResponseDto[]> {
    const existing = await this.getCategoryOrThrow(id);
    const allCategories = await this.repository.findAllForSite(existing.siteId);
    const ancestors = getAncestors(allCategories, id);
    return this.toResponseDtos(ancestors);
  }

  async getBreadcrumb(id: string): Promise<CategoryBreadcrumbItem[]> {
    const existing = await this.getCategoryOrThrow(id);
    const allCategories = await this.repository.findAllForSite(existing.siteId);
    return getBreadcrumb(allCategories, id);
  }
}
