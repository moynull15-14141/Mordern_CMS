import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { ArticleSortField } from '../constants/article.constants';

/**
 * Public query surface for `GET /public/articles` — deliberately a smaller,
 * separate DTO from the admin `ArticleQueryDto`: no `status`/`visibility`
 * params (both forced server-side, never caller-controlled — see
 * `PublicArticlesService`), no `authorId`/`publishedFrom`/`publishedTo`
 * (out of this milestone's explicit scope — see
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md "Known Limitations"). Reuses the
 * real `ArticleSortField` enum directly — the same field names the
 * existing repository's `SORT_FIELD_MAP` already supports.
 */
export class PublicArticleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across title, subtitle, and summary.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ArticleSortField, default: ArticleSortField.PUBLISHED_AT })
  @IsOptional()
  @IsEnum(ArticleSortField)
  sortBy?: ArticleSortField = ArticleSortField.PUBLISHED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
