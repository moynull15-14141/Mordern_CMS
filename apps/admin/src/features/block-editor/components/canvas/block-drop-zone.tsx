'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/utils/cn';

/**
 * A drop target for an *empty* container — `SortableContext` alone gives
 * dnd-kit nothing to drop onto once a container has zero children, so an
 * empty container would otherwise be impossible to drag a block into.
 * `id` is a synthetic id (`empty-container-{parentId}`, see
 * `block-canvas.tsx`'s `onDragEnd`), never a real block id.
 */
export function BlockDropZone({ parentId }: { parentId: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `empty-container-${parentId}` });

  return (
    <div
      ref={setNodeRef}
      data-testid={`drop-zone-${parentId}`}
      className={cn(
        'rounded-sm border border-dashed p-4 text-center text-xs text-muted-foreground',
        isOver ? 'border-primary bg-accent' : 'border-border'
      )}
    >
      Drop a block here
    </div>
  );
}
