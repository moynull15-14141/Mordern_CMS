import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
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

/** Mirrors the real `MenuItem` columns 1:1 (Backend Milestone 11.1 schema).
 * Exactly one of `pageId`/`articleId`/`categoryId`/`url` must be set,
 * matching `targetType` — enforced by `MenusValidator.validateItemTarget`
 * (a cross-field rule, same class of check `ArticlesValidator`/
 * `PagesValidator` already do beyond what class-validator decorators can
 * express alone). */
export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  label!: string;

  @ApiProperty({ enum: MenuItemTargetType })
  @IsEnum(MenuItemTargetType)
  targetType!: MenuItemTargetType;

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

  @ApiPropertyOptional({ description: 'Required for EXTERNAL_URL/CUSTOM_URL target types.' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @ApiPropertyOptional({ enum: MenuItemOpenMode, default: MenuItemOpenMode.SELF })
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

  @ApiPropertyOptional({ description: 'Omit for a top-level (root) item.' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Omit to append to the end of its sibling group.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    type: Object,
    description:
      'Mega-menu layout metadata (column, featured, description, thumbnail, etc.) — open-ended.',
  })
  @IsOptional()
  @IsObject()
  layoutMeta?: Record<string, unknown>;
}
