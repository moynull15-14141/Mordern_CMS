import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { CommentSortField } from '../constants/comment.constants';

/**
 * Satisfies the milestone brief's "CommentListDto" — list responses reuse
 * the shared `PaginatedResult<CommentResponseDto>` contract (see
 * `common/dto/pagination.dto.ts`), so a separate list-envelope class would
 * duplicate what `ApiWrappedResponse(..., { isArray: true })` plus this
 * query DTO already express, matching Media/Articles' precedent.
 */
export class CommentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across the comment body.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  articleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter to direct replies of this comment id.' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    enum: CommentStatus,
    description:
      'Non-moderators are always restricted to APPROVED regardless of this value — see "Permission Flow".',
  })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @ApiPropertyOptional({ enum: CommentSortField, default: CommentSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(CommentSortField)
  sortBy?: CommentSortField = CommentSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
