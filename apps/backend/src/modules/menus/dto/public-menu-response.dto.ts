import { ApiProperty } from '@nestjs/swagger';
import { PublicMenuItemTreeNodeResponseDto } from './public-menu-item-response.dto';

/** Rendering-only shape — no `status`, no audit fields, no `deletedAt`
 * (only PUBLISHED, non-deleted menus ever reach this DTO in the first
 * place, so those fields would be redundant/leak internal state). */
export class PublicMenuResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiProperty({ type: [PublicMenuItemTreeNodeResponseDto] })
  items!: PublicMenuItemTreeNodeResponseDto[];
}
