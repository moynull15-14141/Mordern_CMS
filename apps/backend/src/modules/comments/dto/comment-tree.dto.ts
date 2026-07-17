import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from './comment-response.dto';

/** Nested reply tree — unlimited depth (see `utils/comment-tree.util.ts`). */
export class CommentTreeDto extends CommentResponseDto {
  @ApiProperty({ type: () => [CommentTreeDto] })
  children!: CommentTreeDto[];
}
