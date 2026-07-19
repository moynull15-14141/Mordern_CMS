import { ApiPropertyOptional } from '@nestjs/swagger';
import { LayoutStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { LayoutSortField } from '../constants/layout.constants';

export class LayoutQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LayoutStatus })
  @IsOptional()
  @IsEnum(LayoutStatus)
  status?: LayoutStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  themeId?: string;

  @ApiPropertyOptional({ description: 'Free-text search across name.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LayoutSortField, default: LayoutSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(LayoutSortField)
  sortBy?: LayoutSortField = LayoutSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
