import { ApiProperty } from '@nestjs/swagger';
import { MenuItemOpenMode, MenuItemTargetType } from '@prisma/client';

/** Rendering-only shape for the public Navigation API (Backend Milestones
 * 11.3–11.4) — deliberately excludes `pageId`/`articleId`/`categoryId`
 * (internal ids), `layoutMeta`, `isBroken`, and every audit field the
 * admin `MenuItemResponseDto` exposes.
 *
 * `url` (raw `MenuItem.url` column, EXTERNAL_URL/CUSTOM_URL only) is kept
 * unchanged from Milestone 11.3 for backward compatibility. `resolvedUrl`
 * (Milestone 11.4) is the field a consumer should actually render an
 * `href` from — for PAGE/ARTICLE/CATEGORY targets it's server-resolved
 * from the target's real slug (`/about`, `/blog/{slug}`, `/category/{slug}`,
 * see `PublicMenusService`'s URL resolver); for EXTERNAL_URL/CUSTOM_URL
 * it equals `url`. An item whose internal target cannot be resolved
 * (deleted/missing) is omitted from the response entirely — it never
 * reaches this DTO with a null `resolvedUrl`. */
export class PublicMenuItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ enum: MenuItemTargetType })
  targetType!: MenuItemTargetType;

  @ApiProperty({
    nullable: true,
    description: 'Raw MenuItem.url column — EXTERNAL_URL/CUSTOM_URL only.',
  })
  url!: string | null;

  @ApiProperty({
    description: 'Server-resolved href — always populated for every item in the response.',
  })
  resolvedUrl!: string;

  @ApiProperty({
    description: 'true for EXTERNAL_URL/CUSTOM_URL, false for PAGE/ARTICLE/CATEGORY.',
  })
  isExternal!: boolean;

  @ApiProperty({
    nullable: true,
    description: 'Slug of the resolved Page/Article/Category — null for external targets.',
  })
  targetSlug!: string | null;

  @ApiProperty({ enum: MenuItemOpenMode })
  openMode!: MenuItemOpenMode;

  @ApiProperty({ nullable: true })
  icon!: string | null;

  @ApiProperty({ nullable: true })
  cssClass!: string | null;
}

export class PublicMenuItemTreeNodeResponseDto extends PublicMenuItemResponseDto {
  @ApiProperty({ type: () => [PublicMenuItemTreeNodeResponseDto] })
  children!: PublicMenuItemTreeNodeResponseDto[];
}
