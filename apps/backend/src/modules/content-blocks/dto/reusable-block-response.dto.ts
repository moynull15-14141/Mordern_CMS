import { ApiProperty } from '@nestjs/swagger';

export class ReusableBlockResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  category!: string | null;

  @ApiProperty()
  blockType!: string;

  @ApiProperty({ type: Object })
  data!: unknown;

  @ApiProperty({ type: [Object], nullable: true })
  children!: unknown[] | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
