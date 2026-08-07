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
 * Requests a presigned direct-to-R2 PUT URL — the browser uploads bytes
 * straight to R2, the backend never receives them. Creates a `PROCESSING`
 * `MediaAsset` row with a server-generated `storageKey` up front (see
 * `filename-sanitizer.util.ts`'s `buildStorageKey`) so the returned
 * `mediaAssetId` can be polled immediately.
 */
export class CreateUploadRequestDto {
  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type!: MediaType;

  @ApiProperty({
    description: 'Original client filename — sanitized before use as a storage locator.',
  })
  @IsString()
  @MaxLength(300)
  filename!: string;

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
  @IsUUID()
  folderId?: string;
}
