import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';

export class ArticleRevisionResponseDto {
  @ApiProperty()
  version!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  summary!: string | null;

  @ApiProperty({ type: Object })
  body!: unknown;

  @ApiProperty({ enum: ContentStatus })
  status!: ContentStatus;

  @ApiProperty()
  authorId!: string;

  @ApiProperty({ nullable: true })
  comment!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class ArticleRevisionMetadataDto {
  @ApiProperty()
  version!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  summary!: string | null;

  @ApiProperty({ enum: ContentStatus })
  status!: ContentStatus;

  @ApiProperty()
  authorId!: string;

  @ApiProperty()
  wordCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ nullable: true })
  comment!: string | null;
}

export class ArticleRevisionCompareDto {
  @ApiProperty({ type: ArticleRevisionMetadataDto })
  from!: ArticleRevisionMetadataDto;

  @ApiProperty({ type: ArticleRevisionMetadataDto })
  to!: ArticleRevisionMetadataDto;
}
