import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { COMMENT_BODY_MAX_LENGTH, COMMENT_BODY_MIN_LENGTH } from '../constants/comment.constants';

/**
 * Always authored by the authenticated caller (`Comment.userId`) — this
 * milestone's `POST /comments` requires the global `JwtAuthGuard` like
 * every other endpoint (no `@Public()`), so the schema's anonymous
 * `authorName`/`authorEmail` columns are never populated by this API. See
 * docs/49_COMMENTS_ARCHITECTURE.md "Conflict Resolution".
 */
export class CreateCommentDto {
  @ApiProperty({ description: 'The article being commented on.' })
  @IsUUID()
  articleId!: string;

  @ApiPropertyOptional({
    description: 'Parent comment id, for a reply. Omit for a top-level comment.',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ minLength: COMMENT_BODY_MIN_LENGTH, maxLength: COMMENT_BODY_MAX_LENGTH })
  @IsString()
  @MinLength(COMMENT_BODY_MIN_LENGTH)
  @MaxLength(COMMENT_BODY_MAX_LENGTH)
  body!: string;
}
