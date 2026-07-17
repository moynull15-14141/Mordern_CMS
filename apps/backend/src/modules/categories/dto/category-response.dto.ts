import { ApiProperty } from '@nestjs/swagger';
import { CategoryStatus } from '@prisma/client';
import { CategorySeoDto } from './category-seo.dto';

export class CategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: CategoryStatus })
  status!: CategoryStatus;

  @ApiProperty({ nullable: true })
  parentId!: string | null;

  @ApiProperty({ nullable: true })
  sortOrder!: number | null;

  @ApiProperty({
    description: 'Computed live from Article.primaryCategoryId — not a stored column.',
  })
  articleCount!: number;

  @ApiProperty({ description: 'Computed live from active child categories — not a stored column.' })
  childrenCount!: number;

  @ApiProperty({ type: CategorySeoDto, nullable: true })
  seo!: CategorySeoDto | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}

export class CategoryTreeNodeResponseDto extends CategoryResponseDto {
  @ApiProperty({ type: () => [CategoryTreeNodeResponseDto] })
  children!: CategoryTreeNodeResponseDto[];
}

export class CategoryBreadcrumbItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}
