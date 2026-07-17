import { Injectable } from '@nestjs/common';
import { MediaFolder } from '@prisma/client';
import { TreeNode } from '../../categories/utils/category-tree.util';
import {
  MediaFolderResponseDto,
  MediaFolderTreeNodeResponseDto,
} from '../dto/media-folder-response.dto';

export interface MediaFolderMapperContext {
  childrenCount: number;
  assetCount: number;
}

@Injectable()
export class MediaFolderMapper {
  toResponseDto(folder: MediaFolder, context: MediaFolderMapperContext): MediaFolderResponseDto {
    return {
      id: folder.id,
      name: folder.name,
      slug: folder.slug,
      parentId: folder.parentId,
      childrenCount: context.childrenCount,
      assetCount: context.assetCount,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      deletedAt: folder.deletedAt?.toISOString() ?? null,
    };
  }

  /** Tree nodes are built without live asset counts (a full tree walk would
   * otherwise require N extra queries) — `assetCount` is `0` here; callers
   * needing exact counts should fetch individual folders instead. */
  toTreeNodeDto(node: TreeNode<MediaFolder>): MediaFolderTreeNodeResponseDto {
    return {
      id: node.id,
      name: node.name,
      slug: node.slug,
      parentId: node.parentId,
      childrenCount: node.children.length,
      assetCount: 0,
      createdAt: node.createdAt.toISOString(),
      updatedAt: node.updatedAt.toISOString(),
      deletedAt: node.deletedAt?.toISOString() ?? null,
      children: node.children.map((child) => this.toTreeNodeDto(child)),
    };
  }
}
