import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { ReusableBlockSortField } from '../constants/reusable-block.constants';

export class ReusableBlockQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blockType?: string;

  @ApiPropertyOptional({ description: 'Free-text search across name.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ReusableBlockSortField, default: ReusableBlockSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(ReusableBlockSortField)
  sortBy?: ReusableBlockSortField = ReusableBlockSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
