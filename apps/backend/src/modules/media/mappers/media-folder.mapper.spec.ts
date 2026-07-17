import { MediaFolder } from '@prisma/client';
import { TreeNode } from '../../categories/utils/category-tree.util';
import { MediaFolderMapper } from './media-folder.mapper';

function buildFolder(overrides: Partial<MediaFolder> = {}): MediaFolder {
  return {
    id: 'folder-1',
    siteId: 'site-1',
    parentId: null,
    name: 'Photos',
    slug: 'photos',
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as MediaFolder;
}

describe('MediaFolderMapper', () => {
  const mapper = new MediaFolderMapper();

  it('maps a folder with counts', () => {
    const result = mapper.toResponseDto(buildFolder(), { childrenCount: 2, assetCount: 5 });
    expect(result.id).toBe('folder-1');
    expect(result.childrenCount).toBe(2);
    expect(result.assetCount).toBe(5);
  });

  it('maps a deleted folder', () => {
    const result = mapper.toResponseDto(buildFolder({ deletedAt: new Date('2026-02-01') }), {
      childrenCount: 0,
      assetCount: 0,
    });
    expect(result.deletedAt).toBe('2026-02-01T00:00:00.000Z');
  });

  it('toTreeNodeDto maps a leaf node with childrenCount 0', () => {
    const node: TreeNode<MediaFolder> = { ...buildFolder(), children: [] };
    const result = mapper.toTreeNodeDto(node);
    expect(result.childrenCount).toBe(0);
    expect(result.assetCount).toBe(0);
    expect(result.children).toEqual([]);
  });

  it('toTreeNodeDto maps nested children recursively', () => {
    const child: TreeNode<MediaFolder> = { ...buildFolder({ id: 'child-1' }), children: [] };
    const node: TreeNode<MediaFolder> = { ...buildFolder(), children: [child] };
    const result = mapper.toTreeNodeDto(node);
    expect(result.childrenCount).toBe(1);
    expect(result.children[0].id).toBe('child-1');
  });
});
