import { ForbiddenException, Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { ArticlePolicySubject } from '../../authorization/policies/article.policy';
import { ArticlesRepository, ArticleWithRelations } from '../repositories/articles.repository';
import { ArticlesValidator } from '../validators/articles.validator';
import { ArticlesMapper } from '../mappers/articles.mapper';
import { ArticleOwnershipPolicy } from '../policies/article-ownership.policy';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../utils/slug.util';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/article.constants';
import { ArticleQueryOptions } from '../interfaces/article-query.interface';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ScheduleArticleDto } from '../dto/schedule-article.dto';
import { ArticleResponseDto } from '../dto/article-response.dto';
import {
  ArticleRevisionMetadataDto,
  ArticleRevisionResponseDto,
} from '../dto/article-revision-response.dto';
import {
  ArticleAlreadyDeletedException,
  ArticleNotDeletedException,
  ArticleNotFoundException,
  ArticleRevisionNotFoundException,
  AuthorNotFoundException,
  CategoryNotFoundException,
  SlugConflictException,
  TagNotFoundException,
} from '../exceptions/article.exceptions';

interface ActingUser {
  id: string;
}

@Injectable()
export class ArticlesService {
  constructor(
    private readonly repository: ArticlesRepository,
    private readonly validator: ArticlesValidator,
    private readonly mapper: ArticlesMapper,
    private readonly authorizationService: AuthorizationService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getArticleOrThrow(
    id: string,
    includeDeleted = false
  ): Promise<ArticleWithRelations> {
    const article = await this.repository.findById(id, includeDeleted);
    if (!article) {
      throw new ArticleNotFoundException(id);
    }
    return article;
  }

  private toSubject(article: ArticleWithRelations): ArticlePolicySubject {
    return { authorId: article.authorId, authorUserId: article.author.userId };
  }

  private async assertCanEdit(
    article: ArticleWithRelations,
    actor: ActingUser,
    action: 'update' | 'delete'
  ): Promise<void> {
    const effectiveRoles = await this.authorizationService.resolveEffectiveRoles(actor.id);
    const policy = new ArticleOwnershipPolicy(actor.id);
    const subject = this.toSubject(article);
    const allowed =
      action === 'update'
        ? policy.canUpdate(effectiveRoles, subject)
        : policy.canDelete(effectiveRoles, subject);
    if (!allowed) {
      throw new ForbiddenException(`You do not have permission to ${action} this article.`);
    }
  }

  private async resolveUniqueSlug(
    requestedSlug: string | undefined,
    title: string,
    siteId: string,
    excludeId?: string
  ): Promise<string> {
    const isTaken = async (candidate: string) =>
      Boolean(await this.repository.findBySlug(candidate, siteId, excludeId));

    if (requestedSlug) {
      const normalized = normalizeSlug(requestedSlug);
      this.validator.validateSlugShape(normalized);
      if (await isTaken(normalized)) {
        throw new SlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(title);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  private async validateReferences(dto: {
    authorId?: string;
    primaryCategoryId?: string;
    tagIds?: string[];
    featuredMediaId?: string;
  }): Promise<void> {
    if (dto.authorId) {
      const author = await this.repository.findAuthorById(dto.authorId);
      if (!author) throw new AuthorNotFoundException(dto.authorId);
    }
    if (dto.primaryCategoryId) {
      const category = await this.repository.findCategoryById(dto.primaryCategoryId);
      if (!category) throw new CategoryNotFoundException(dto.primaryCategoryId);
    }
    if (dto.tagIds && dto.tagIds.length > 0) {
      const found = await this.repository.findTagsByIds(dto.tagIds);
      if (found.length !== dto.tagIds.length) {
        const foundIds = new Set(found.map((t) => t.id));
        const missing = dto.tagIds.find((id) => !foundIds.has(id));
        throw new TagNotFoundException(missing ?? dto.tagIds[0]);
      }
    }
    if (dto.featuredMediaId) {
      const media = await this.repository.findMediaAssetById(dto.featuredMediaId);
      if (!media) throw new ArticleNotFoundException(`media:${dto.featuredMediaId}`);
    }
  }

  /** Snapshots the article's state as it was BEFORE the caller's change is
   * applied — revisions record who authored that version of the content
   * (`article.authorId`), not who performed the edit action triggering the
   * snapshot; `ArticleRevision` has no separate "edited by" column. */
  private async snapshotRevision(
    article: ArticleWithRelations,
    comment?: string,
    tx?: Parameters<ArticlesRepository['createRevision']>[1]
  ): Promise<void> {
    const nextVersion = (await this.repository.getMaxRevisionVersion(article.id, tx)) + 1;
    await this.repository.createRevision(
      {
        article: { connect: { id: article.id } },
        version: nextVersion,
        body: article.body as Prisma.InputJsonValue,
        title: article.title,
        summary: article.summary,
        status: article.status,
        author: { connect: { id: article.authorId } },
        comment: comment ?? null,
      },
      tx
    );
  }

  /**
   * Create + tag assignment + initial revision now run inside one Prisma
   * interactive transaction (stabilization patch, post-Final-Backend-Audit
   * — the audit flagged this three-step sequence as a partial-failure
   * risk: if `setTags`/`snapshotRevision` threw after the article row
   * committed, the result was an article with missing tags or no initial
   * revision). `upsertSeoMeta` (above) intentionally stays OUTSIDE the
   * transaction — on failure it only orphans a standalone `SeoMeta` row,
   * which is harmless and was never the risk the audit identified.
   */
  async createArticle(dto: CreateArticleDto, actor: ActingUser): Promise<ArticleResponseDto> {
    await this.validateReferences(dto);
    const site = await this.repository.getDefaultSite();
    const slug = await this.resolveUniqueSlug(dto.slug, dto.title, site.id);

    let seoMetaId: string | undefined;
    if (dto.seo) {
      seoMetaId = await this.repository.upsertSeoMeta(
        null,
        site.id,
        dto.seo as Prisma.SeoMetaCreateInput,
        actor.id
      );
    }

    const created = await this.repository.transaction(async (tx) => {
      const article = await this.repository.create(
        {
          site: { connect: { id: site.id } },
          author: { connect: { id: dto.authorId } },
          primaryCategory: dto.primaryCategoryId
            ? { connect: { id: dto.primaryCategoryId } }
            : undefined,
          title: dto.title,
          subtitle: dto.subtitle,
          slug,
          summary: dto.summary,
          body: dto.body as Prisma.InputJsonValue,
          visibility: dto.visibility,
          language: dto.language,
          locale: dto.locale,
          featuredMedia: dto.featuredMediaId ? { connect: { id: dto.featuredMediaId } } : undefined,
          notes: dto.notes,
          seoMeta: seoMetaId ? { connect: { id: seoMetaId } } : undefined,
          createdBy: actor.id,
          updatedBy: actor.id,
        },
        tx
      );

      if (dto.tagIds && dto.tagIds.length > 0) {
        await this.repository.setTags(article.id, dto.tagIds, dto.primaryTagId, tx);
      }

      await this.snapshotRevision(article, 'Initial version', tx);

      return article;
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'article.create',
      resource: 'article',
      resourceId: created.id,
      result: 'success',
    });

    const withTags =
      dto.tagIds && dto.tagIds.length > 0 ? await this.getArticleOrThrow(created.id) : created;
    return this.mapper.toResponseDto(withTags);
  }

  async getArticle(id: string): Promise<ArticleResponseDto> {
    const article = await this.getArticleOrThrow(id);
    return this.mapper.toResponseDto(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleResponseDto> {
    const site = await this.repository.getDefaultSite();
    const article = await this.repository.findBySlugWithRelations(slug, site.id);
    if (!article) {
      throw new ArticleNotFoundException(slug);
    }
    return this.mapper.toResponseDto(article);
  }

  async listArticles(options: ArticleQueryOptions): Promise<PaginatedResult<ArticleResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toResponseDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updateArticle(
    id: string,
    dto: UpdateArticleDto,
    actor: ActingUser
  ): Promise<ArticleResponseDto> {
    const existing = await this.getArticleOrThrow(id);
    await this.assertCanEdit(existing, actor, 'update');
    this.validator.assertGenericUpdateStatus(dto.status);
    await this.validateReferences(dto);

    await this.snapshotRevision(existing, dto.revisionComment);

    const site = await this.repository.getDefaultSite();
    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.title ?? existing.title, site.id, id)
        : undefined;

    let seoMetaId: string | undefined;
    if (dto.seo) {
      seoMetaId = await this.repository.upsertSeoMeta(
        existing.seoMeta?.id ?? null,
        site.id,
        dto.seo as Prisma.SeoMetaUpdateInput,
        actor.id
      );
    }

    const updated = await this.repository.update(id, {
      title: dto.title,
      subtitle: dto.subtitle,
      slug,
      summary: dto.summary,
      body: dto.body as Prisma.InputJsonValue | undefined,
      status: dto.status as ContentStatus | undefined,
      primaryCategory: dto.primaryCategoryId
        ? { connect: { id: dto.primaryCategoryId } }
        : undefined,
      visibility: dto.visibility,
      featuredMedia: dto.featuredMediaId ? { connect: { id: dto.featuredMediaId } } : undefined,
      notes: dto.notes,
      seoMeta: seoMetaId ? { connect: { id: seoMetaId } } : undefined,
      updatedBy: actor.id,
    });

    if (dto.tagIds) {
      await this.repository.setTags(id, dto.tagIds, dto.primaryTagId);
    }

    this.auditLogger.record({
      actorId: actor.id,
      action: 'article.update',
      resource: 'article',
      resourceId: id,
      result: 'success',
    });

    const final = dto.tagIds ? await this.getArticleOrThrow(id) : updated;
    return this.mapper.toResponseDto(final);
  }

  async deleteArticle(id: string, actor: ActingUser): Promise<ArticleResponseDto> {
    const existing = await this.getArticleOrThrow(id);
    if (existing.deletedAt) {
      throw new ArticleAlreadyDeletedException(id);
    }
    await this.assertCanEdit(existing, actor, 'delete');
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'article.delete',
      resource: 'article',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getArticleOrThrow(id, true));
  }

  async restoreArticle(id: string, actor: ActingUser): Promise<ArticleResponseDto> {
    const existing = await this.getArticleOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new ArticleNotDeletedException(id);
    }
    await this.assertCanEdit(existing, actor, 'delete');
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'article.restore',
      resource: 'article',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getArticleOrThrow(id));
  }

  /** Gated by `article.publish` at the controller (no ownership policy —
   * publishing is an editorial-tier action, not an ownership-tier one; see
   * docs/46_ARTICLES_ARCHITECTURE.md "Permission Flow"). */
  async publishArticle(id: string, actor: ActingUser): Promise<ArticleResponseDto> {
    const existing = await this.getArticleOrThrow(id);
    await this.snapshotRevision(existing, 'Published');
    const updated = await this.repository.update(id, {
      status: ContentStatus.PUBLISHED,
      publishedAt: existing.publishedAt ?? new Date(),
      scheduledAt: null,
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'article.publish',
      resource: 'article',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(updated);
  }

  async scheduleArticle(
    id: string,
    dto: ScheduleArticleDto,
    actor: ActingUser
  ): Promise<ArticleResponseDto> {
    const existing = await this.getArticleOrThrow(id);
    const scheduledAt = new Date(dto.scheduledAt);
    this.validator.assertFutureDate(scheduledAt, 'scheduledAt');
    await this.snapshotRevision(existing, 'Scheduled');
    const updated = await this.repository.update(id, {
      status: ContentStatus.SCHEDULED,
      scheduledAt,
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'article.schedule',
      resource: 'article',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(updated);
  }

  async listRevisions(articleId: string): Promise<ArticleRevisionResponseDto[]> {
    await this.getArticleOrThrow(articleId, true);
    const revisions = await this.repository.findRevisions(articleId);
    return revisions.map((revision) => this.mapper.toRevisionResponseDto(revision));
  }

  async compareRevisions(
    articleId: string,
    fromVersion: number,
    toVersion: number
  ): Promise<{ from: ArticleRevisionMetadataDto; to: ArticleRevisionMetadataDto }> {
    await this.getArticleOrThrow(articleId, true);
    const [from, to] = await Promise.all([
      this.repository.findRevision(articleId, fromVersion),
      this.repository.findRevision(articleId, toVersion),
    ]);
    if (!from) throw new ArticleRevisionNotFoundException(fromVersion);
    if (!to) throw new ArticleRevisionNotFoundException(toVersion);
    return {
      from: this.mapper.toRevisionMetadataDto(from),
      to: this.mapper.toRevisionMetadataDto(to),
    };
  }

  async restoreRevision(
    articleId: string,
    version: number,
    actor: ActingUser
  ): Promise<ArticleResponseDto> {
    const existing = await this.getArticleOrThrow(articleId);
    await this.assertCanEdit(existing, actor, 'update');
    const revision = await this.repository.findRevision(articleId, version);
    if (!revision) {
      throw new ArticleRevisionNotFoundException(version);
    }

    // Snapshot current (pre-restore) state first — never mutate history,
    // only ever append (ArticleRevision is append-only by schema design).
    await this.snapshotRevision(existing, `Before restoring version ${version}`);

    const updated = await this.repository.update(articleId, {
      title: revision.title,
      summary: revision.summary,
      body: revision.body as Prisma.InputJsonValue,
      status: revision.status,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'article.restore_revision',
      resource: 'article',
      resourceId: articleId,
      result: 'success',
    });

    return this.mapper.toResponseDto(updated);
  }
}
