import { Injectable } from '@nestjs/common';
import { LayoutAssignment, LayoutAssignmentContentType } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { LayoutAssignmentsRepository } from '../repositories/layout-assignments.repository';
import { LayoutAssignmentsValidator } from '../validators/layout-assignments.validator';
import { LayoutAssignmentsMapper } from '../mappers/layout-assignments.mapper';
import { AssignLayoutDto } from '../dto/assign-layout.dto';
import { LayoutAssignmentResponseDto } from '../dto/layout-assignment-response.dto';
import {
  LayoutAssignmentNotFoundException,
  LayoutAssignmentTargetNotFoundException,
} from '../exceptions/layout.exceptions';

interface ActingUser {
  id: string;
}

/**
 * LayoutAssignments backend module (Backend Milestone 14.1) — assigns a
 * `Layout` to Homepage/Page/Article/Category (instance-specific) or to a
 * whole content type site-wide (content-default — every entity FK null).
 * See docs/78_LAYOUT_ENGINE.md "Resolution Flow".
 */
@Injectable()
export class LayoutAssignmentsService {
  constructor(
    private readonly repository: LayoutAssignmentsRepository,
    private readonly validator: LayoutAssignmentsValidator,
    private readonly mapper: LayoutAssignmentsMapper,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getAssignmentOrThrow(
    id: string,
    includeDeleted = false
  ): Promise<LayoutAssignment> {
    const assignment = await this.repository.findById(id, includeDeleted);
    if (!assignment) {
      throw new LayoutAssignmentNotFoundException(id);
    }
    return assignment;
  }

  /** Confirms `layoutId` and whichever single entity FK is set actually
   * exist before writing — mirrors `MenusService`'s own
   * `findPageById`/`findArticleById`/`findCategoryById` checks for
   * `MenuItem`, so a bad id gets a friendly
   * `LayoutAssignmentTargetNotFoundException` instead of a raw FK
   * constraint violation surfacing as a generic 500. */
  private async assertTargetsExist(dto: AssignLayoutDto): Promise<void> {
    const layout = await this.repository.findLayoutById(dto.layoutId);
    if (!layout) {
      throw new LayoutAssignmentTargetNotFoundException('Layout', dto.layoutId);
    }
    if (dto.pageId) {
      const page = await this.repository.findPageById(dto.pageId);
      if (!page) throw new LayoutAssignmentTargetNotFoundException('Page', dto.pageId);
    }
    if (dto.articleId) {
      const article = await this.repository.findArticleById(dto.articleId);
      if (!article) throw new LayoutAssignmentTargetNotFoundException('Article', dto.articleId);
    }
    if (dto.categoryId) {
      const category = await this.repository.findCategoryById(dto.categoryId);
      if (!category) throw new LayoutAssignmentTargetNotFoundException('Category', dto.categoryId);
    }
  }

  /** Upsert semantics — see `AssignLayoutDto`'s doc comment. Calling this
   * twice for the same target (contentType + entity FKs) updates the
   * existing row's `layoutId` rather than creating a duplicate, since two
   * assignments for the identical target would make resolution
   * ambiguous. */
  async assignLayout(
    dto: AssignLayoutDto,
    actor: ActingUser
  ): Promise<LayoutAssignmentResponseDto> {
    this.validator.validateAssignmentTarget({
      contentType: dto.contentType,
      pageId: dto.pageId,
      articleId: dto.articleId,
      categoryId: dto.categoryId,
    });
    await this.assertTargetsExist(dto);

    const site = await this.repository.getDefaultSite();
    const target = {
      contentType: dto.contentType,
      pageId: dto.pageId ?? null,
      articleId: dto.articleId ?? null,
      categoryId: dto.categoryId ?? null,
    };

    const existing = await this.repository.findByTarget(site.id, target);

    const assignment = existing
      ? await this.repository.update(existing.id, {
          layout: { connect: { id: dto.layoutId } },
          updatedBy: actor.id,
        })
      : await this.repository.create({
          site: { connect: { id: site.id } },
          layout: { connect: { id: dto.layoutId } },
          contentType: target.contentType,
          page: target.pageId ? { connect: { id: target.pageId } } : undefined,
          article: target.articleId ? { connect: { id: target.articleId } } : undefined,
          category: target.categoryId ? { connect: { id: target.categoryId } } : undefined,
          createdBy: actor.id,
          updatedBy: actor.id,
        });

    this.auditLogger.record({
      actorId: actor.id,
      action: existing ? 'layout-assignment.update' : 'layout-assignment.create',
      resource: 'layout-assignment',
      resourceId: assignment.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(assignment);
  }

  async getAssignment(id: string): Promise<LayoutAssignmentResponseDto> {
    return this.mapper.toResponseDto(await this.getAssignmentOrThrow(id));
  }

  async listAssignments(
    contentType?: LayoutAssignmentContentType
  ): Promise<LayoutAssignmentResponseDto[]> {
    const site = await this.repository.getDefaultSite();
    const items = await this.repository.findMany(site.id, contentType);
    return items.map((item) => this.mapper.toResponseDto(item));
  }

  async unassign(id: string, actor: ActingUser): Promise<LayoutAssignmentResponseDto> {
    await this.getAssignmentOrThrow(id);
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'layout-assignment.delete',
      resource: 'layout-assignment',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getAssignmentOrThrow(id, true));
  }

  async restoreAssignment(id: string, actor: ActingUser): Promise<LayoutAssignmentResponseDto> {
    await this.getAssignmentOrThrow(id, true);
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'layout-assignment.restore',
      resource: 'layout-assignment',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getAssignmentOrThrow(id));
  }
}
