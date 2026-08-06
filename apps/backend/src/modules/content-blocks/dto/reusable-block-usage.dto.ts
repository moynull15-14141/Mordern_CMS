import { ApiProperty } from '@nestjs/swagger';

export class ReusableBlockUsageReferenceDto {
  @ApiProperty({ enum: ['page', 'article'] })
  contentType!: 'page' | 'article';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;
}
