import { ApiProperty } from '@nestjs/swagger';
import { PatternStatus } from '@prisma/client';

export class PatternResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  category!: string | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ enum: PatternStatus })
  status!: PatternStatus;

  @ApiProperty({
    nullable: true,
    description:
      'Existing MediaAsset id — resolve its display URL via the existing Media system (GET /media/:id).',
  })
  thumbnailMediaId!: string | null;

  @ApiProperty({ type: Object, description: 'The full block tree — `{ blocks: BlockNode[] }`.' })
  body!: unknown;

  @ApiProperty()
  version!: number;

  @ApiProperty({ nullable: true })
  createdBy!: string | null;

  @ApiProperty({ nullable: true })
  updatedBy!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}

/** A lighter shape for list/grid responses — omits `body` (the full block
 * tree can be large; list rows never render it, only the thumbnail/name/
 * category/tags, matching the plan's "don't render every pattern in full
 * detail on the list page" performance requirement). */
export class PatternSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  category!: string | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ enum: PatternStatus })
  status!: PatternStatus;

  @ApiProperty({ nullable: true })
  thumbnailMediaId!: string | null;

  @ApiProperty({
    description:
      'Top-level block count — a lightweight complexity signal without shipping the full tree.',
  })
  blockCount!: number;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
