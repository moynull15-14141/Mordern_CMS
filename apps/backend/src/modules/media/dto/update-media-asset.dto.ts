import { ApiPropertyOptional } from '@nestjs/swagger';
import { MediaStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/** PATCH semantics. Rename/Move/Copy-metadata use their own dedicated
 * endpoints (see docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Media Strategy"). */
export class UpdateMediaAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  credit?: string;

  @ApiPropertyOptional({ enum: MediaStatus })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;
}
