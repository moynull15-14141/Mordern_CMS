import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateSeoDto } from './create-seo.dto';

/**
 * "Upsert SEO" (`POST /seo/upsert`) — generic, by-id semantics: if `id` is
 * given and an active row exists, it is updated; otherwise a new row is
 * created. `SeoMeta` has no natural business key (no slug, unlike
 * Article/Category), so id-based upsert is the only unambiguous semantic
 * available without inventing one — see docs/51_SEO_ARCHITECTURE.md
 * "Conflict Resolution."
 */
export class UpsertSeoDto extends CreateSeoDto {
  @ApiPropertyOptional({
    description: 'Existing SeoMeta id to update. Omit to always create a new row.',
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}
