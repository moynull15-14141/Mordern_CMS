import { Injectable } from '@nestjs/common';
import {
  Layout,
  LayoutAssignment,
  LayoutAssignmentContentType,
  Prisma,
  Site,
} from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface AssignmentTarget {
  contentType: LayoutAssignmentContentType;
  pageId: string | null;
  articleId: string | null;
  categoryId: string | null;
}

/**
 * Full CRUD for `LayoutAssignment`, mirroring `LayoutsRepository`'s shape.
 * `findByTarget` is the one method both the admin "assign" upsert and the
 * public resolve path (explicit-tier and content-default-tier lookups —
 * see `PublicLayoutsService`) share: an exact-match query on every target
 * field, including matching a literal `null` for "content-type-wide
 * default" (Prisma translates `{ pageId: null }` to `page_id IS NULL`
 * correctly — no special-casing needed here for that shape).
 */
@Injectable()
export class LayoutAssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.LayoutAssignmentWhereInput {
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

  async findById(id: string, includeDeleted = false): Promise<LayoutAssignment | null> {
    return this.prisma.layoutAssignment.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  async findByTarget(siteId: string, target: AssignmentTarget): Promise<LayoutAssignment | null> {
    return this.prisma.layoutAssignment.findFirst({
      where: {
        siteId,
        contentType: target.contentType,
        pageId: target.pageId,
        articleId: target.articleId,
        categoryId: target.categoryId,
        deletedAt: null,
      },
    });
  }

  /** Public read path — same exact-match target query as `findByTarget`,
   * additionally gated to only a PUBLISHED, non-deleted `Layout` (a
   * DRAFT/ARCHIVED or soft-deleted Layout's preset must never leak to the
   * public pipeline, same "published/active only" rule every other public
   * read path in this codebase enforces — see
   * docs/75_BACKEND_PUBLIC_CONTENT_API.md). Returns the joined `Layout` so
   * `PublicLayoutsService` never needs a second round-trip for
   * `layoutPreset`. */
  async findPublishedByTarget(
    siteId: string,
    target: AssignmentTarget
  ): Promise<(LayoutAssignment & { layout: Layout }) | null> {
    return this.prisma.layoutAssignment.findFirst({
      where: {
        siteId,
        contentType: target.contentType,
        pageId: target.pageId,
        articleId: target.articleId,
        categoryId: target.categoryId,
        deletedAt: null,
        layout: { status: 'PUBLISHED', deletedAt: null },
      },
      include: { layout: true },
    });
  }

  async findMany(
    siteId: string,
    contentType?: LayoutAssignmentContentType
  ): Promise<LayoutAssignment[]> {
    return this.prisma.layoutAssignment.findMany({
      where: { siteId, deletedAt: null, ...(contentType ? { contentType } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Cross-entity existence checks for `AssignLayoutDto`'s
  // `layoutId`/`pageId`/`articleId`/`categoryId` — a raw, single-purpose
  // Prisma query in this repository rather than importing the owning
  // module, same pattern `MenusRepository.findPageById`/`findArticleById`/
  // `findCategoryById` already establish. ---

  async findLayoutById(id: string): Promise<{ id: string } | null> {
    return this.prisma.layout.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  }

  async findPageById(id: string): Promise<{ id: string } | null> {
    return this.prisma.page.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  }

  async findArticleById(id: string): Promise<{ id: string } | null> {
    return this.prisma.article.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  }

  async findCategoryById(id: string): Promise<{ id: string } | null> {
    return this.prisma.category.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  }

  async create(data: Prisma.LayoutAssignmentCreateInput): Promise<LayoutAssignment> {
    return this.prisma.layoutAssignment.create({ data });
  }

  async update(id: string, data: Prisma.LayoutAssignmentUpdateInput): Promise<LayoutAssignment> {
    return this.prisma.layoutAssignment.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<LayoutAssignment> {
    return this.prisma.layoutAssignment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<LayoutAssignment> {
    return this.prisma.layoutAssignment.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }
}
