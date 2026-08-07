import { ApiProperty } from '@nestjs/swagger';

export class PatternUsageReferenceDto {
  @ApiProperty({ enum: ['page', 'article', 'reusable-block'] })
  contentType!: 'page' | 'article' | 'reusable-block';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false })
  slug?: string;
}
