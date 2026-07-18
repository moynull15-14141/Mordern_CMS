import { ApiPropertyOptional } from '@nestjs/swagger';
import { MenuItemOpenMode, MenuItemTargetType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/** PATCH semantics — every field optional, only provided fields change.
 * `parentId` may also be changed here (a single-item reparent) in addition
 * to the bulk `POST /menus/:id/items/reorder` endpoint — both paths run
 * through the same `MenusValidator` parent/circular-reference checks. */
export class UpdateMenuItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiPropertyOptional({ enum: MenuItemTargetType })
  @IsOptional()
  @IsEnum(MenuItemTargetType)
  targetType?: MenuItemTargetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  articleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @ApiPropertyOptional({ enum: MenuItemOpenMode })
  @IsOptional()
  @IsEnum(MenuItemOpenMode)
  openMode?: MenuItemOpenMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cssClass?: string;

  @ApiPropertyOptional({ description: 'Set to null to move to the top level.' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  layoutMeta?: Record<string, unknown>;
}
