import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { COMMENT_MODERATION_REASON_MAX_LENGTH } from '../constants/comment.constants';

export class SpamCommentDto {
  @ApiPropertyOptional({
    description: 'Optional moderator note, stored in Comment.moderationReason.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(COMMENT_MODERATION_REASON_MAX_LENGTH)
  reason?: string;
}
