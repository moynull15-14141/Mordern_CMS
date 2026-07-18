import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { PageSeoDto } from './page-seo.dto';

/** Mirrors `CreateArticleDto`, scoped to the fields `Page` actually has —
 * no author/category/tags/visibility/language/locale (not on the `Page`
 * model). No `status` field — the backend assigns DRAFT server-side,
 * same as Articles. */
export class CreatePageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiPropertyOptional({ description: 'Omit to auto-generate from title.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiProperty({ type: Object, description: 'Rich content body (JSON document tree).' })
  @IsObject()
  body!: Record<string, unknown>;

  @ApiPropertyOptional({ type: PageSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PageSeoDto)
  seo?: PageSeoDto;
}
