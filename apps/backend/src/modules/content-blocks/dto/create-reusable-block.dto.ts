import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from '../constants/reusable-block.constants';

/**
 * `blockType`/`data`/`children` are validated for shape by
 * `BlockTreeValidator` (wrapping the single node — with its children — in a
 * one-block tree, see `ReusableBlocksService.createReusableBlock`) rather
 * than redeclaring per-block-type DTOs here, same reasoning Articles/Pages
 * keep `body` as `@IsObject()` and push shape validation to the service
 * layer. Reference-cycle safety (a `children` subtree that itself contains
 * a `reusable-block` node) is `ReusableBlockCycleValidator`'s job, also at
 * the service layer.
 */
export class CreateReusableBlockDto {
  @ApiProperty()
  @IsString()
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiPropertyOptional({ description: 'Free-text grouping label — no fixed taxonomy yet.' })
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_MAX_LENGTH)
  category?: string;

  @ApiProperty({ description: 'One of the block-schema BlockType values, e.g. "callout".' })
  @IsString()
  blockType!: string;

  @ApiProperty({ type: Object, description: "The block's `data` shape for its `blockType`." })
  @IsObject()
  data!: Record<string, unknown>;

  @ApiPropertyOptional({
    type: [Object],
    description:
      "The block's nested children (container types only, e.g. `columns`/`accordion`/`tabs`/`container`) — same `BlockNode[]` shape Page/Article bodies use.",
  })
  @IsOptional()
  @IsArray()
  children?: Record<string, unknown>[];
}
