import { ApiProperty } from '@nestjs/swagger';
import { MediaStatus, MediaType } from '@prisma/client';
import { MediaUsageReferenceDto } from './media-usage.dto';

export class MediaResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MediaType })
  type!: MediaType;

  @ApiProperty({ enum: MediaStatus })
  status!: MediaStatus;

  @ApiProperty({
    description:
      'Immutable real storage locator — never changed by rename (see "Rename" strategy).',
  })
  storageKey!: string;

  @ApiProperty({
    description:
      'Logical display name — stored in metadata.filename, defaults to the storageKey basename.',
  })
  filename!: string;

  @ApiProperty({
    nullable: true,
    description: 'Stored in metadata.folderId — no real FK column exists on MediaAsset.',
  })
  folderId!: string | null;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty({ description: 'BigInt serialized as a string.' })
  filesize!: string;

  @ApiProperty({ nullable: true })
  width!: number | null;

  @ApiProperty({ nullable: true })
  height!: number | null;

  @ApiProperty({ nullable: true })
  duration!: number | null;

  @ApiProperty({ nullable: true })
  altText!: string | null;

  @ApiProperty({ nullable: true })
  caption!: string | null;

  @ApiProperty({ nullable: true })
  credit!: string | null;

  @ApiProperty()
  uploadedBy!: string;

  @ApiProperty({ description: 'Count of detected structural references — see "Usage Detection".' })
  usageCount!: number;

  @ApiProperty({ type: [MediaUsageReferenceDto] })
  usages!: MediaUsageReferenceDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
