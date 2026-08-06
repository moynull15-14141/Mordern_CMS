import { ApiProperty } from '@nestjs/swagger';

/** Rendering-only shape for `GET /public/content-blocks/reusable/:id` —
 * mirrors `PublicPageResponseDto`'s "never reuse Admin DTOs" rule
 * (`public-page-response.dto.ts`'s doc comment): excludes `name` (editorial
 * label, not rendering-relevant) and every audit field
 * `ReusableBlockResponseDto` exposes. */
export class PublicReusableBlockResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  blockType!: string;

  @ApiProperty({ type: Object })
  data!: unknown;

  @ApiProperty({ type: [Object], required: false })
  children?: unknown[];
}
