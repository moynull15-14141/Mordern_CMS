import { ApiProperty } from '@nestjs/swagger';
import { LayoutAssignmentContentType } from '@prisma/client';

/** Flat response — raw FK ids, no nested Layout/Page/Article/Category
 * object, mirroring `MenuItemResponseDto`'s own "flat ids, no joins"
 * shape. */
export class LayoutAssignmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  layoutId!: string;

  @ApiProperty({ enum: LayoutAssignmentContentType })
  contentType!: LayoutAssignmentContentType;

  @ApiProperty({ nullable: true })
  pageId!: string | null;

  @ApiProperty({ nullable: true })
  articleId!: string | null;

  @ApiProperty({ nullable: true })
  categoryId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ nullable: true })
  deletedAt!: string | null;
}
