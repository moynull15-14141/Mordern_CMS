import { ApiProperty } from '@nestjs/swagger';

export class ReusableBlockResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  blockType!: string;

  @ApiProperty({ type: Object })
  data!: unknown;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
