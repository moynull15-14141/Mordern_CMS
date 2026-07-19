import { ApiProperty } from '@nestjs/swagger';

/**
 * The two DB-backed tiers of `LayoutResolver`'s 4-tier priority chain
 * (docs/78_LAYOUT_ENGINE.md "Resolution Flow": Explicit assignment ->
 * Content default -> Theme default -> System default) — the frontend
 * itself decides `explicitLayoutPreset ?? contentDefaultLayoutPreset ??
 * <theme.layout.homepage/blog, already on RenderContext> ?? 'default'`.
 * Both fields are independently nullable rather than one already-merged
 * value, so the frontend resolver visibly implements all four tiers
 * instead of two of them being hidden inside this endpoint.
 */
export class PublicLayoutResolutionResponseDto {
  @ApiProperty({
    nullable: true,
    description: 'From an instance-specific LayoutAssignment, if one exists.',
  })
  explicitLayoutPreset!: string | null;

  @ApiProperty({
    nullable: true,
    description: 'From a content-type-wide default LayoutAssignment, if one exists.',
  })
  contentDefaultLayoutPreset!: string | null;
}
