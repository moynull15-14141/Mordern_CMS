import { ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { CategorySortField } from '../constants/category.constants';

export class CategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({ description: 'Filter to direct children of this category id.' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

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
