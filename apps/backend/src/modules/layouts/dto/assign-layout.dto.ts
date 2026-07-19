import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LayoutAssignmentContentType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

/**
 * Assigns (or re-assigns) a Layout to one target. Upsert semantics at the
 * service layer, keyed on `(siteId, contentType, pageId, articleId,
 * categoryId)` — calling this twice for the same target updates the same
 * row rather than erroring, since "assign a layout to X" is naturally an
 * idempotent "set" operation, not a strict create.
 *
 * Leave `pageId`/`articleId`/`categoryId` all unset for a
 * content-type-wide default (PAGE/ARTICLE/CATEGORY only — see
 * `LayoutAssignment`'s Prisma doc comment); set exactly the one matching
 * `contentType` for an instance-specific assignment; `contentType:
 * "HOMEPAGE"` must never set any of the three (validated by
 * `LayoutAssignmentsValidator`).
 */
export class AssignLayoutDto {
  @ApiProperty()
  @IsUUID()
  layoutId!: string;

  @ApiProperty({ enum: LayoutAssignmentContentType })
  @IsEnum(LayoutAssignmentContentType)
  contentType!: LayoutAssignmentContentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  articleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
