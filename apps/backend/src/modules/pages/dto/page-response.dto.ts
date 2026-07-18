import { ApiProperty } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { PageSeoDto } from './page-seo.dto';

export class PageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: Object })
  body!: unknown;

  @ApiProperty({ enum: ContentStatus })
  status!: ContentStatus;

  @ApiProperty({ nullable: true })
  publishedAt!: string | null;

  @ApiProperty({ type: PageSeoDto, nullable: true })
  seo!: PageSeoDto | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
