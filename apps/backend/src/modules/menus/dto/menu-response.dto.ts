import { ApiProperty } from '@nestjs/swagger';
import { MenuStatus } from '@prisma/client';
import { MenuItemTreeNodeResponseDto } from './menu-item-response.dto';

export class MenuResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  location!: string | null;

  @ApiProperty({ enum: MenuStatus })
  status!: MenuStatus;

  @ApiProperty({ type: [MenuItemTreeNodeResponseDto] })
  items!: MenuItemTreeNodeResponseDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
