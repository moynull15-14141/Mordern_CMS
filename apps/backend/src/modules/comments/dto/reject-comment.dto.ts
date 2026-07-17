import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { COMMENT_MODERATION_REASON_MAX_LENGTH } from '../constants/comment.constants';

export class RejectCommentDto {
  @ApiProperty({
    description: 'Required — why the comment was rejected. Stored in Comment.moderationReason.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(COMMENT_MODERATION_REASON_MAX_LENGTH)
  reason!: string;
}
