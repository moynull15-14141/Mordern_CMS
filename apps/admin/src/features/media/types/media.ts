/** Mirrors the real backend enums exactly (`@prisma/client`, `36_DATABASE_FREEZE.md`). */
export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
export type MediaStatus = 'PROCESSING' | 'READY' | 'FAILED' | 'ARCHIVED';

export type MediaSortField = 'filename' | 'mimeType' | 'filesize' | 'createdAt' | 'updatedAt';

export interface MediaUsageReference {
  source: 'User.profileImage' | 'Author.profileImage' | 'Article.featuredMedia' | 'ArticleMedia';
  id: string;
  label: string;
}

/** Mirrors `MediaResponseDto` exactly. No `url` field exists — there is no
 * upload/storage/streaming engine in this milestone's backend (see
 * `create-media-asset.dto.ts`'s own comment: "NO upload engine"). */
export interface Media {
  id: string;
  type: MediaType;
  status: MediaStatus;
  storageKey: string;
  filename: string;
  folderId: string | null;
  mimeType: string;
  /** BigInt serialized as a string. */
  filesize: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  altText: string | null;
  caption: string | null;
  credit: string | null;
  uploadedBy: string;
  usageCount: number;
  usages: MediaUsageReference[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MediaFilters {
  page?: number;
  limit?: number;
  search?: string;
  filename?: string;
  mimeType?: string;
  extension?: string;
  folderId?: string;
  type?: MediaType;
  status?: MediaStatus;
  uploadedBy?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: MediaSortField;
  sortOrder?: 'asc' | 'desc';
}

/** `CreateMediaAssetDto` 1:1 — registers metadata for a file assumed to
 * already exist at `storageKey`; no bytes are transferred by this or any
 * other endpoint. */
export interface CreateMediaAssetInput {
  type: MediaType;
  storageKey: string;
  mimeType: string;
  filesize: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
  caption?: string;
  credit?: string;
  filename?: string;
  folderId?: string;
}

/** `UpdateMediaAssetDto` 1:1 (PATCH semantics). */
export interface UpdateMediaAssetInput {
  altText?: string;
  caption?: string;
  credit?: string;
  status?: MediaStatus;
}

/** `RenameMediaAssetDto` 1:1 — logical display name only. */
export interface RenameMediaAssetInput {
  filename: string;
}

/** `MoveMediaAssetDto` 1:1 — omit/null moves to root (no folder). */
export interface MoveMediaAssetInput {
  folderId?: string | null;
}

/** `CopyMediaMetadataDto` 1:1. */
export interface CopyMediaMetadataInput {
  targetId: string;
}

/** Mirrors `MediaFolderResponseDto` — only the fields this milestone's
 * folder filter/picker needs (no full Folder CRUD UI; see
 * docs/67_FRONTEND_MEDIA.md "Known Limitations"). */
export interface MediaFolder {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  childrenCount: number;
  assetCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MediaFolderTreeNode extends MediaFolder {
  children: MediaFolderTreeNode[];
}
