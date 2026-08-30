import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RedirectStatus } from '@prisma/client';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { RedirectSortField } from '../constants/redirect.constants';

export class RedirectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across source path and destination.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RedirectStatus })
  @IsOptional()
  @IsEnum(RedirectStatus)
  status?: RedirectStatus;

  @ApiPropertyOptional({ enum: RedirectSortField, default: RedirectSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(RedirectSortField)
  sortBy?: RedirectSortField = RedirectSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
