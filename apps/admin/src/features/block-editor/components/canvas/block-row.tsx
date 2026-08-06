'use client';

import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { useEditorActions, useSelectedId } from '../../context/use-block-editor';
import { getBlockDefinition } from '../../registry/block-registry';
import { BlockTypePicker } from '../block-picker/block-type-picker';
import { BlockDropZone } from './block-drop-zone';
import type { BlockNode } from '../../types/block.types';

/**
 * One row per block, recursing into its own children for container
 * types. Selection/drag/actions all read/write the shared editor store
 * via the generic hooks — this component has no knowledge of "article"
 * or "page," only of `BlockNode`/`BlockDefinition`.
 */
export function BlockRow({ block, depth }: { block: BlockNode; depth: number }) {
  const definition = getBlockDefinition(block.type);
  const selectedId = useSelectedId();
  const { selectBlock, removeBlockById, duplicateBlockById, insertBlock } = useEditorActions();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const isSelected = selectedId === block.id;
  const Icon = definition?.icon;
  const childIds = block.children?.map((child) => child.id) ?? [];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-sm border',
        isSelected ? 'border-primary' : 'border-border',
        isDragging && 'opacity-50'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        data-testid={`block-row-${block.id}`}
        className="flex items-center gap-2 p-2"
        onClick={() => selectBlock(block.id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectBlock(block.id);
          }
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="cursor-grab text-muted-foreground"
        >
          <GripVertical className="size-4" />
        </button>
        {Icon ? <Icon className="size-4 text-muted-foreground" aria-hidden="true" /> : null}
        <span className="flex-1 text-sm">{definition?.label ?? block.type}</span>
        {definition?.container ? (
          <BlockTypePicker
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Add child block"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus className="size-4" />
              </Button>
            }
            onSelect={(type) => insertBlock(type, block.id, childIds.length)}
          />
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Duplicate block"
          onClick={(event) => {
            event.stopPropagation();
            duplicateBlockById(block.id);
          }}
        >
          <Copy className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete block"
          onClick={(event) => {
            event.stopPropagation();
            removeBlockById(block.id);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {definition?.container ? (
        <div className="space-y-2 border-t border-border p-2 pl-6">
          {block.children && block.children.length > 0 ? (
            <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
              {block.children.map((child) => (
                <BlockRow key={child.id} block={child} depth={depth + 1} />
              ))}
            </SortableContext>
          ) : (
            <BlockDropZone parentId={block.id} />
          )}
        </div>
      ) : null}
    </div>
  );
}
