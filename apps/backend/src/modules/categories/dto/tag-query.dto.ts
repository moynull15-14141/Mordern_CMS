import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { TagSortField } from '../constants/category.constants';

export class TagQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across name and description.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: TagSortField, default: TagSortField.NAME })
  @IsOptional()
  @IsEnum(TagSortField)
  sortBy?: TagSortField = TagSortField.NAME;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
