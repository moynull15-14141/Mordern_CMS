'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MediaFolderTreeNode } from '../types/media';

export interface FolderTreeProps {
  nodes: MediaFolderTreeNode[];
  selectedId?: string;
  onSelect: (folderId: string | undefined) => void;
}

/**
 * Real recursive expand/collapse tree for the List page sidebar — plain
 * React state, no new dependency (matches the plan's explicit call-out
 * that this needs no library). Distinct from the existing
 * `parent-folder-select.tsx` (a flattened `<Select>` for modal form
 * fields — different use case, kept as-is, not replaced by this).
 */
export function FolderTree({ nodes, selectedId, onSelect }: FolderTreeProps) {
  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => onSelect(undefined)}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-sm hover:bg-accent',
          selectedId === undefined && 'bg-accent font-medium'
        )}
      >
        <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        All media
      </button>
      {nodes.map((node) => (
        <FolderTreeRow
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function FolderTreeRow({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: MediaFolderTreeNode;
  depth: number;
  selectedId?: string;
  onSelect: (folderId: string | undefined) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 rounded-sm px-2 py-1 text-sm hover:bg-accent',
          isSelected && 'bg-accent font-medium'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn('shrink-0 rounded-sm p-0.5 hover:bg-muted', !hasChildren && 'invisible')}
          aria-label={expanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-3.5" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          {isSelected ? (
            <FolderOpen className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="truncate">{node.name}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{node.assetCount}</span>
        </button>
      </div>
      {expanded && hasChildren
        ? node.children.map((child) => (
            <FolderTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  );
}
