import { ApiProperty } from '@nestjs/swagger';

export class MediaFolderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  parentId!: string | null;

  @ApiProperty({ description: 'Computed live from active child folders — not a stored column.' })
  childrenCount!: number;

  @ApiProperty({
    description: 'Computed live from MediaAsset.metadata.folderId matches — not a stored column.',
  })
  assetCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}

export class MediaFolderTreeNodeResponseDto extends MediaFolderResponseDto {
  @ApiProperty({ type: () => [MediaFolderTreeNodeResponseDto] })
  children!: MediaFolderTreeNodeResponseDto[];
}

export class MediaFolderBreadcrumbItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}
