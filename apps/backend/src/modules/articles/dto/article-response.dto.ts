import { ApiProperty } from '@nestjs/swagger';
import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { ArticleSeoDto } from './article-seo.dto';

export class ArticleAuthorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  penName!: string;

  @ApiProperty({ nullable: true })
  userId!: string | null;
}

export class ArticleCategoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class ArticleTagDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  primary!: boolean;
}

export class ArticleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  subtitle!: string | null;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  summary!: string | null;

  @ApiProperty({ type: Object })
  body!: unknown;

  @ApiProperty({ enum: ContentStatus })
  status!: ContentStatus;

  @ApiProperty({ nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ nullable: true })
  scheduledAt!: string | null;

  @ApiProperty({ enum: ArticleVisibility })
  visibility!: ArticleVisibility;

  @ApiProperty()
  language!: string;

  @ApiProperty()
  locale!: string;

  @ApiProperty({ nullable: true })
  canonicalUrl!: string | null;

  @ApiProperty({ nullable: true })
  readingTime!: number | null;

  @ApiProperty({ nullable: true })
  wordCount!: number | null;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty({ nullable: true })
  featuredMediaId!: string | null;

  @ApiProperty({ type: ArticleAuthorDto })
  author!: ArticleAuthorDto;

  @ApiProperty({ type: ArticleCategoryDto, nullable: true })
  category!: ArticleCategoryDto | null;

  @ApiProperty({ type: [ArticleTagDto] })
  tags!: ArticleTagDto[];

  @ApiProperty({ type: ArticleSeoDto, nullable: true })
  seo!: ArticleSeoDto | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
