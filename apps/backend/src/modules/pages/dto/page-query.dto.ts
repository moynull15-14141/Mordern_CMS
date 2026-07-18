import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { PageSortField } from '../constants/page.constants';

export class PageQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Free-text search across title.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PageSortField, default: PageSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(PageSortField)
  sortBy?: PageSortField = PageSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
