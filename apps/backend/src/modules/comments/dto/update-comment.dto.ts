import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { COMMENT_BODY_MAX_LENGTH, COMMENT_BODY_MIN_LENGTH } from '../constants/comment.constants';

/** Body only — ownership-gated (own comment, or Moderator/Administrator/
 * Super Admin). No other field is editable via the generic update. */
export class UpdateCommentDto {
  @ApiProperty({ minLength: COMMENT_BODY_MIN_LENGTH, maxLength: COMMENT_BODY_MAX_LENGTH })
  @IsString()
  @MinLength(COMMENT_BODY_MIN_LENGTH)
  @MaxLength(COMMENT_BODY_MAX_LENGTH)
  body!: string;
}
