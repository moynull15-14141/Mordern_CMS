'use client';

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorActions, useEditorBlocks } from '../../context/use-block-editor';
import { findParentId, getSiblings } from '../../state/block-tree.util';
import { BlockRow } from './block-row';
import { BlockTypePicker } from '../block-picker/block-type-picker';

const EMPTY_CONTAINER_PREFIX = 'empty-container-';

/**
 * The generic drag-and-drop engine's root — one `DndContext` for the
 * whole tree (nested `SortableContext`s per container, in `BlockRow`, are
 * a dnd-kit-supported pattern for tree-shaped sortable UIs). `onDragEnd`
 * resolves the drop target's parent/index by walking the *tree*
 * (`findParentId`/`getSiblings`), not dnd-kit's own container-id
 * bookkeeping — this is what lets one `moveBlockTo` action serve both
 * "reorder within the same parent" and "move into a different container"
 * without two separate code paths.
 */
export function BlockCanvas() {
  const blocks = useEditorBlocks();
  const { moveBlockTo, insertBlock } = useEditorActions();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith(EMPTY_CONTAINER_PREFIX)) {
      const parentId = overId.slice(EMPTY_CONTAINER_PREFIX.length);
      moveBlockTo(activeId, parentId, 0);
      return;
    }

    const overParentId = findParentId(blocks, overId);
    const siblings = getSiblings(blocks, overParentId);
    const overIndex = siblings.findIndex((block) => block.id === overId);
    if (overIndex === -1) return;
    moveBlockTo(activeId, overParentId, overIndex);
  }

  const topLevelIds = blocks.map((block) => block.id);

  return (
    <div className="space-y-2 p-4" data-testid="block-canvas">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
          {blocks.length === 0 ? (
            <p className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No blocks yet — add one to get started.
            </p>
          ) : (
            blocks.map((block) => <BlockRow key={block.id} block={block} depth={0} />)
          )}
        </SortableContext>
      </DndContext>
      <BlockTypePicker
        trigger={
          <Button type="button" variant="outline" size="sm">
            <Plus className="size-4" />
            Add block
          </Button>
        }
        onSelect={(type) => insertBlock(type, null, blocks.length)}
      />
    </div>
  );
}
