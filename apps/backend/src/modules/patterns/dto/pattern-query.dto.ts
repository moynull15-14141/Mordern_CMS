import { ApiPropertyOptional } from '@nestjs/swagger';
import { PatternStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { PatternSortField } from '../constants/patterns.constants';

export class PatternQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across name and description.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Comma-separated tag list — matches any (OR).' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ enum: PatternStatus })
  @IsOptional()
  @IsEnum(PatternStatus)
  status?: PatternStatus;

  @ApiPropertyOptional({ enum: PatternSortField, default: PatternSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(PatternSortField)
  sortBy?: PatternSortField = PatternSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
