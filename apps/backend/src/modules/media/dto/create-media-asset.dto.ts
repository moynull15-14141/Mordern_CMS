import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Registers a `MediaAsset` row for an object the caller has already placed
 * in storage by some other means (e.g. a server-side import/migration) —
 * metadata only, no file bytes accepted here. For a real end-user upload,
 * use `MediaUploadController`'s presigned-URL flow
 * (`POST /media/upload-requests` → PUT → `POST /media/:id/confirm-upload`,
 * Milestone 5) instead.
 */
export class CreateMediaAssetDto {
  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type!: MediaType;

  @ApiProperty({ description: 'The real, immutable storage locator (path/key).' })
  @IsString()
  @MaxLength(1000)
  storageKey!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  mimeType!: string;

  @ApiProperty({ description: 'Bytes, as a numeric string (BigInt-safe).' })
  @IsNumberString()
  filesize!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

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

  @ApiPropertyOptional({
    description:
      'Logical display name, stored in metadata.filename. Omit to derive from storageKey.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  filename?: string;

  @ApiPropertyOptional({
    description: 'Existing MediaFolder id, stored in metadata.folderId (no real FK column exists).',
  })
  @IsOptional()
  @IsUUID()
  folderId?: string;
}
