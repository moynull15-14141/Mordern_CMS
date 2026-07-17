import { ApiProperty } from '@nestjs/swagger';
import { SeoFieldsDto } from './seo-fields.dto';

/** Request body for `POST /seo/preview` — a candidate set of SEO fields,
 * not persisted. Reuses `SeoFieldsDto` (see that file's doc comment). */
export class SeoPreviewRequestDto extends SeoFieldsDto {}

export class SeoPreviewDto {
  @ApiProperty({
    nullable: true,
    description:
      'The entity value, or SettingCategory.SEO\'s defaultMetaTitle if unset — see "Preview Strategy".',
  })
  title!: string | null;

  @ApiProperty({
    nullable: true,
    description: "The entity value, or SettingCategory.SEO's defaultMetaDescription if unset.",
  })
  description!: string | null;

  @ApiProperty({
    nullable: true,
    description: 'openGraph.image, falling back to twitterCard.image.',
  })
  image!: string | null;

  @ApiProperty({ nullable: true })
  canonical!: string | null;

  @ApiProperty({ type: Object, nullable: true })
  robots!: Record<string, unknown> | null;

  @ApiProperty({ type: Object, nullable: true })
  openGraph!: Record<string, unknown> | null;

  @ApiProperty({ type: Object, nullable: true })
  twitterCard!: Record<string, unknown> | null;
}
