import { ApiProperty } from '@nestjs/swagger';
import { MenuItemOpenMode, MenuItemTargetType } from '@prisma/client';

export class MenuItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  parentId!: string | null;

  @ApiProperty()
  label!: string;

  @ApiProperty({ enum: MenuItemTargetType })
  targetType!: MenuItemTargetType;

  @ApiProperty({ nullable: true })
  pageId!: string | null;

  @ApiProperty({ nullable: true })
  articleId!: string | null;

  @ApiProperty({ nullable: true })
  categoryId!: string | null;

  @ApiProperty({ nullable: true })
  url!: string | null;

  @ApiProperty({ enum: MenuItemOpenMode })
  openMode!: MenuItemOpenMode;

  @ApiProperty({ nullable: true })
  icon!: string | null;

  @ApiProperty({ nullable: true })
  cssClass!: string | null;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: Object, nullable: true })
  layoutMeta!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  /** True when `targetType` is PAGE/ARTICLE/CATEGORY and the referenced
   * row no longer resolves (soft-deleted target — the FK is `SetNull`, so
   * this item survives with its id column nulled rather than vanishing;
   * see docs/71_BACKEND_MENUS.md "Known Limitations"). Computed by the
   * mapper, not a DB column. */
  @ApiProperty()
  isBroken!: boolean;
}

/** Nested tree response — `children` recurses. Never exposes the flat
 * `parentId`-keyed rows a client would have to re-assemble itself
 * (mirrors `CategoryTreeNodeResponseDto`). */
export class MenuItemTreeNodeResponseDto extends MenuItemResponseDto {
  @ApiProperty({ type: () => [MenuItemTreeNodeResponseDto] })
  children!: MenuItemTreeNodeResponseDto[];
}
