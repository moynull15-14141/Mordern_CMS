import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { CategorySortField } from '../constants/category.constants';

/**
 * Public query surface for `GET /public/categories` — deliberately a
 * smaller, separate DTO from the admin `CategoryQueryDto`: no `status`
 * param (always forced to ACTIVE server-side, never caller-controlled —
 * see `PublicCategoriesService`), no `parentId` filter (no public
 * category-tree feature this milestone). Reuses the real
 * `CategorySortField` enum directly — same field names the existing
 * repository's `SORT_FIELD_MAP` already supports, not a new vocabulary.
 */
export class PublicCategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across name and description.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CategorySortField, default: CategorySortField.SORT_ORDER })
  @IsOptional()
  @IsEnum(CategorySortField)
  sortBy?: CategorySortField = CategorySortField.SORT_ORDER;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
