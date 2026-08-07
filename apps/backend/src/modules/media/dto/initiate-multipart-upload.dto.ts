import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MediaType } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class InitiateMultipartUploadDto {
  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type!: MediaType;

  @ApiProperty()
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

  @ApiProperty({ description: 'Number of parts the client will upload (S3/R2 multipart).' })
  @IsInt()
  @Min(2)
  partCount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  folderId?: string;
}

export class CompleteMultipartUploadPartDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  partNumber!: number;

  @ApiProperty()
  @IsString()
  etag!: string;
}

export class CompleteMultipartUploadDto {
  @ApiProperty()
  @IsString()
  uploadId!: string;

  @ApiProperty({ type: [CompleteMultipartUploadPartDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompleteMultipartUploadPartDto)
  parts!: CompleteMultipartUploadPartDto[];
}

export class AbortMultipartUploadDto {
  @ApiProperty()
  @IsString()
  uploadId!: string;
}
