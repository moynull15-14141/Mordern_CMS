import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, MaxLength, MinLength } from 'class-validator';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '../constants/reusable-block.constants';

/**
 * `blockType`/`data` are validated for shape by `BlockTreeValidator`
 * (wrapping the single node in a one-block tree — see
 * `ReusableBlocksService.createReusableBlock`) rather than redeclaring
 * per-block-type DTOs here, same reasoning Articles/Pages keep `body` as
 * `@IsObject()` and push shape validation to the service layer.
 */
export class CreateReusableBlockDto {
  @ApiProperty()
  @IsString()
  @MinLength(NAME_MIN_LENGTH)
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ description: 'One of the block-schema BlockType values, e.g. "callout".' })
  @IsString()
  blockType!: string;

  @ApiProperty({ type: Object, description: "The block's `data` shape for its `blockType`." })
  @IsObject()
  data!: Record<string, unknown>;
}
