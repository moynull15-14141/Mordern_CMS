'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';
import type { MediaFolderTreeNode } from '../types/media';

export interface ParentFolderSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const ROOT_VALUE = '__root__';

function flattenFolders(nodes: MediaFolderTreeNode[]): MediaFolderTreeNode[] {
  return nodes.flatMap((node) => [node, ...flattenFolders(node.children)]);
}

/** `GET /media-folders/tree` (flattened) — used by the Upload queue and
 * the Move-to-folder dialog. Same permission caveat as
 * `ParentCategorySelect`/`MediaFilters`. */
export function ParentFolderSelect({ id, value, onChange, onBlur, disabled }: ParentFolderSelectProps) {
  const { data, isError } = useMediaFolderTree();

  if (isError) {
    return <p className="text-sm text-muted-foreground">You don&apos;t have permission to view folders.</p>;
  }

  const options = data ? flattenFolders(data) : [];

  return (
    <Select value={value || ROOT_VALUE} onValueChange={(next) => onChange(next === ROOT_VALUE ? '' : next)} disabled={disabled || !data}>
      <SelectTrigger id={id} onBlur={onBlur}>
        <SelectValue placeholder="No folder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ROOT_VALUE}>No folder</SelectItem>
        {options.map((folder) => (
          <SelectItem key={folder.id} value={folder.id}>
            {folder.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
