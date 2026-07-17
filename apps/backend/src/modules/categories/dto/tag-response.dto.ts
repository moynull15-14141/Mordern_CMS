import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ type: [String], nullable: true })
  synonyms!: string[] | null;

  @ApiProperty({ description: 'Computed live from ArticleTag rows — not a stored column.' })
  usageCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
