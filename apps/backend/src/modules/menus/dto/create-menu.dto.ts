import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Mirrors `CreatePageDto`'s shape — no `status` field; every created menu
 * starts DRAFT (server-assigned), matching Pages/Articles. No inline
 * `items` — items are added via the dedicated `POST /menus/:id/items`
 * endpoint, avoiding the "parentId referencing a not-yet-created sibling"
 * problem a nested create would introduce (not a workflow this milestone
 * asked for). */
export class CreateMenuDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Omit to auto-generate from name.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Open-ended placement slot, e.g. "header"/"footer"/"sidebar".',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
