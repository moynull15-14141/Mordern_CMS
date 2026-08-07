import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { MediaUrlsDto } from './media-response.dto';

/**
 * Rendering-only shape for the public web renderer (Milestone 5) — never
 * the admin `MediaResponseDto` (no `storageKey`, `uploadedBy`, `usages`,
 * etc.). Mirrors `PublicReusableBlockResponseDto`'s "separate DTO, not the
 * admin one" precedent.
 */
export class PublicMediaResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MediaType })
  type!: MediaType;

  @ApiProperty({ type: MediaUrlsDto })
  urls!: MediaUrlsDto;

  @ApiProperty({ nullable: true })
  altText!: string | null;

  @ApiProperty({ nullable: true })
  caption!: string | null;

  @ApiProperty({ nullable: true })
  width!: number | null;

  @ApiProperty({ nullable: true })
  height!: number | null;

  @ApiProperty({ nullable: true })
  duration!: number | null;

  @ApiProperty({ nullable: true })
  blurPlaceholder!: string | null;

  @ApiProperty({ nullable: true })
  dominantColor!: string | null;
}
