import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

/** No `color` field — the frozen `Tag` model has no such column and no
 * generic metadata column to store one in (see
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Known Gaps"). Not implemented. */
export class CreateTagDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Omit to auto-generate from name.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];
}
