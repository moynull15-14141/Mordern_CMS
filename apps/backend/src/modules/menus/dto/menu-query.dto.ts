import { ApiPropertyOptional } from '@nestjs/swagger';
import { MenuStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { MenuSortField } from '../constants/menu.constants';

export class MenuQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: MenuStatus })
  @IsOptional()
  @IsEnum(MenuStatus)
  status?: MenuStatus;

  @ApiPropertyOptional({ description: 'Exact match on the open-ended location slot.' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Free-text search across name.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MenuSortField, default: MenuSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(MenuSortField)
  sortBy?: MenuSortField = MenuSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
