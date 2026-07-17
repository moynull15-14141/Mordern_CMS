import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { ArticleSortField } from '../constants/article.constants';

export class ArticleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ enum: ArticleVisibility })
  @IsOptional()
  @IsEnum(ArticleVisibility)
  visibility?: ArticleVisibility;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  tagId?: string;

  @ApiPropertyOptional({ description: 'Free-text search across title, subtitle, and summary.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedTo?: string;

  @ApiPropertyOptional({ enum: ArticleSortField, default: ArticleSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(ArticleSortField)
  sortBy?: ArticleSortField = ArticleSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
