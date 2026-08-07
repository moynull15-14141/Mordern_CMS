'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import {
  useEditorActions,
  useEditorBlocks,
  useSelectedId,
  getBlockDefinition,
  findParentId,
  getSiblings,
} from '@/features/block-editor';
import type { BlockNode } from '@/features/block-editor';

function StructureRow({ block, depth }: { block: BlockNode; depth: number }) {
  const blocks = useEditorBlocks();
  const selectedId = useSelectedId();
  const { selectBlock, moveBlockTo, duplicateBlockById, removeBlockById } = useEditorActions();
  const [expanded, setExpanded] = useState(true);

  const definition = getBlockDefinition(block.type);
  const Icon = definition?.icon;
  const hasChildren = Boolean(block.children && block.children.length > 0);
  const isSelected = selectedId === block.id;

  const parentId = findParentId(blocks, block.id);
  const siblings = getSiblings(blocks, parentId);
  const ownIndex = siblings.findIndex((sibling) => sibling.id === block.id);
  const canMoveUp = ownIndex > 0;
  const canMoveDown = ownIndex >= 0 && ownIndex < siblings.length - 1;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        data-testid={`structure-row-${block.id}`}
        className={cn(
          'flex items-center gap-1 rounded-sm px-1 py-1 text-sm hover:bg-accent',
          isSelected && 'bg-accent'
        )}
        style={{ paddingLeft: depth * 16 + 4 }}
        onClick={() => selectBlock(block.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectBlock(block.id);
          }
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            className="shrink-0"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
          >
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {Icon ? (
          <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : null}
        <span className="flex-1 truncate">{definition?.label ?? block.type}</span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Move up"
          disabled={!canMoveUp}
          onClick={(event) => {
            event.stopPropagation();
            moveBlockTo(block.id, parentId, ownIndex - 1);
          }}
        >
          <ChevronRight className="size-3 -rotate-90" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Move down"
          disabled={!canMoveDown}
          onClick={(event) => {
            event.stopPropagation();
            moveBlockTo(block.id, parentId, ownIndex + 1);
          }}
        >
          <ChevronRight className="size-3 rotate-90" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Duplicate"
          onClick={(event) => {
            event.stopPropagation();
            duplicateBlockById(block.id);
          }}
        >
          <Copy className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Delete"
          onClick={(event) => {
            event.stopPropagation();
            removeBlockById(block.id);
          }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
      {hasChildren && expanded
        ? block.children!.map((child) => (
            <StructureRow key={child.id} block={child} depth={depth + 1} />
          ))
        : null}
    </div>
  );
}

/**
 * The optional Structure/Navigator panel (spec Phase 7) — a plain
 * recursive read of the same `BlockNode[]` tree the canvas already
 * renders, via the same store actions (`selectBlock`/`moveBlockTo`/
 * `duplicateBlockById`/`removeBlockById`). No renaming — `BlockNode` has
 * no name/label field to rename (only `type`, which is fixed by what was
 * inserted), so this shows each block's registered label instead, same
 * as every other block-facing UI in this codebase. Reorder here is a
 * keyboard/menu alternative to canvas drag-and-drop (accessibility
 * requirement), not a replacement for it.
 */
export function StructurePanel() {
  const blocks = useEditorBlocks();

  if (blocks.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground" data-testid="structure-panel-empty">
        Nothing on this page yet.
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-2" data-testid="structure-panel">
      {blocks.map((block) => (
        <StructureRow key={block.id} block={block} depth={0} />
      ))}
    </div>
  );
}
