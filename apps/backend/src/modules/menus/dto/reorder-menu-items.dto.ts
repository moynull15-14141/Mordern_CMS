import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReorderMenuItemEntryDto {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ description: 'null/omitted moves the item to the top level.' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  sortOrder!: number;
}

/** `POST /menus/:id/items/reorder` — bulk position update, applied inside
 * one transaction so a partial reorder can never be persisted. Every entry
 * is validated (belongs to this menu, parent exists in the same menu, no
 * circular reference) before any write happens. */
export class ReorderMenuItemsDto {
  @ApiProperty({ type: [ReorderMenuItemEntryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderMenuItemEntryDto)
  items!: ReorderMenuItemEntryDto[];
}
