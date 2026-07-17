import { ApiPropertyOptional } from '@nestjs/swagger';
import { MediaStatus, MediaType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto, SortOrder } from '../../../common/dto/pagination.dto';
import { MediaSortField } from '../constants/media.constants';

export class MediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across storageKey, altText, caption.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  extension?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiPropertyOptional({ enum: MediaStatus })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ enum: MediaSortField, default: MediaSortField.CREATED_AT })
  @IsOptional()
  @IsEnum(MediaSortField)
  sortBy?: MediaSortField = MediaSortField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
