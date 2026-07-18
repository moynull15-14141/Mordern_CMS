import { ApiPropertyOptional } from '@nestjs/swagger';
import { ThemeStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { ThemeSortField } from '../constants/theme.constants';

export class ThemeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ThemeStatus })
  @IsOptional()
  @IsEnum(ThemeStatus)
  status?: ThemeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Free-text search across name.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ThemeSortField, default: ThemeSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(ThemeSortField)
  sortBy?: ThemeSortField = ThemeSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
