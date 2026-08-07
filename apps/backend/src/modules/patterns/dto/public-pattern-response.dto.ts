import { ApiProperty } from '@nestjs/swagger';

/** Rendering-only shape for the admin preview iframe (via `apps/web`) —
 * mirrors `PublicReusableBlockResponseDto`'s "separate DTO, not the admin
 * one" precedent. Never exposed to the public site's real navigation —
 * only fetched by the dedicated `/preview/patterns/[id]` route. */
export class PublicPatternResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: Object })
  body!: unknown;
}
