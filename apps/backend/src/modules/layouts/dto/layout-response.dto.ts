import { ApiProperty } from '@nestjs/swagger';
import { LayoutStatus } from '@prisma/client';

export class LayoutResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: LayoutStatus })
  status!: LayoutStatus;

  @ApiProperty()
  layoutPreset!: string;

  @ApiProperty({ nullable: true })
  themeId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
