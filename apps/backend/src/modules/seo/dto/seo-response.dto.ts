import { ApiProperty } from '@nestjs/swagger';

export class SeoResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  siteId!: string;

  @ApiProperty({ nullable: true })
  title!: string | null;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ type: [String] })
  keywords!: string[];

  @ApiProperty({ nullable: true })
  canonicalUrl!: string | null;

  @ApiProperty({ type: Object, nullable: true })
  openGraph!: Record<string, unknown> | null;

  @ApiProperty({ type: Object, nullable: true })
  twitterCard!: Record<string, unknown> | null;

  @ApiProperty({
    type: Object,
    nullable: true,
    description:
      'Stored as compact JSON; see "Pretty Serialization" for the presentation-only pretty-printed form.',
  })
  schemaJson!: Record<string, unknown> | null;

  @ApiProperty({ type: Object, nullable: true })
  robots!: Record<string, unknown> | null;

  @ApiProperty({ type: Object, nullable: true })
  extraMeta!: Record<string, unknown> | null;

  @ApiProperty({
    nullable: true,
    description:
      'schemaJson, pretty-printed (2-space indent) for human/editor display — presentation only, not a separate stored value.',
  })
  schemaJsonPretty!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
