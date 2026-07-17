import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';

export class CommentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  articleId!: string;

  @ApiProperty({
    nullable: true,
    description:
      'Null for a guest/anonymous comment (schema-supported, not reachable via this API — see docs).',
  })
  userId!: string | null;

  @ApiProperty({ nullable: true })
  authorName!: string | null;

  @ApiProperty({ nullable: true })
  authorEmail!: string | null;

  @ApiProperty({ nullable: true })
  parentId!: string | null;

  @ApiProperty()
  body!: string;

  @ApiProperty({ enum: CommentStatus })
  status!: CommentStatus;

  @ApiProperty({ nullable: true })
  moderationReason!: string | null;

  @ApiProperty()
  votes!: number;

  @ApiProperty({ description: 'Count of direct replies (one level), computed live — not stored.' })
  replyCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
