import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { PageSortField } from '../constants/page.constants';

/**
 * Public query surface for `GET /public/pages` — mirrors
 * `PublicArticleQueryDto`'s exact reasoning: a smaller, separate DTO from
 * the admin `PageQueryDto`, no `status` param (forced to PUBLISHED
 * server-side, never caller-controlled — see `PublicPagesService`).
 */
export class PublicPageQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across title.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PageSortField, default: PageSortField.UPDATED_AT })
  @IsOptional()
  @IsEnum(PageSortField)
  sortBy?: PageSortField = PageSortField.UPDATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
