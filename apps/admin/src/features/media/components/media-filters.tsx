'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_OPTIONS, TYPE_OPTIONS } from '../constants/media.constants';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';
import type { MediaFolderTreeNode, MediaStatus, MediaType } from '../types/media';

export interface MediaFiltersValue {
  type?: MediaType;
  folderId?: string;
  status?: MediaStatus;
  uploadedBy?: string;
}

export interface MediaFiltersProps {
  value: MediaFiltersValue;
  onChange: (value: MediaFiltersValue) => void;
}

const ALL_VALUE = '__all__';

function flattenFolders(nodes: MediaFolderTreeNode[]): MediaFolderTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenFolders(node.children)]);
}

/**
 * Status/Type/Folder map directly onto real `MediaQueryDto` fields.
 * Folder options come from `GET /media-folders/tree` (flattened) — same
 * `category.create`-style permission caveat as Categories/Tags: both
 * `MediaController`/`MediaFolderController` require `media.upload` OR
 * `media.delete`. "Uploaded by" is a real query param (`uploadedBy`) but
 * no Users-list endpoint is reused here (kept feature-self-contained) — a
 * plain UUID input is the same honest choice Articles made for its Author
 * filter in Frontend Milestone 5.
 */
export function MediaFilters({ value, onChange }: MediaFiltersProps) {
  const { data: folderTree } = useMediaFolderTree();
  const folders = folderTree ? flattenFolders(folderTree) : [];

  const hasActiveFilters = Boolean(value.type || value.folderId || value.status || value.uploadedBy);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="media-filter-type">Type</Label>
        <Select
          value={value.type ?? ALL_VALUE}
          onValueChange={(next) => onChange({ ...value, type: next === ALL_VALUE ? undefined : (next as MediaType) })}
        >
          <SelectTrigger id="media-filter-type" className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All types</SelectItem>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="media-filter-status">Status</Label>
        <Select
          value={value.status ?? ALL_VALUE}
          onValueChange={(next) =>
            onChange({ ...value, status: next === ALL_VALUE ? undefined : (next as MediaStatus) })
          }
        >
          <SelectTrigger id="media-filter-status" className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="media-filter-folder">Folder</Label>
        <Select
          value={value.folderId ?? ALL_VALUE}
          onValueChange={(next) => onChange({ ...value, folderId: next === ALL_VALUE ? undefined : next })}
        >
          <SelectTrigger id="media-filter-folder" className="w-40">
            <SelectValue placeholder="All folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All folders</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="media-filter-uploaded-by">Uploaded by (id)</Label>
        <Input
          id="media-filter-uploaded-by"
          className="w-44"
          placeholder="User id (UUID)"
          value={value.uploadedBy ?? ''}
          onChange={(event) => onChange({ ...value, uploadedBy: event.target.value || undefined })}
        />
      </div>

      {hasActiveFilters ? (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
