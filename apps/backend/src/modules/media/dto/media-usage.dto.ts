import { ApiProperty } from '@nestjs/swagger';

export class MediaUsageReferenceDto {
  @ApiProperty({
    enum: ['User.profileImage', 'Author.profileImage', 'Article.featuredMedia', 'ArticleMedia'],
  })
  source!: string;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;
}
