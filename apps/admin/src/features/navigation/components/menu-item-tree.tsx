'use client';

import { useState } from 'react';
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
import { EmptyState } from '@/components/feedback/empty-state';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useUpdateMenuItem,
  useReorderMenuItems,
} from '../hooks/use-menu-item-mutations';
import { useMenuItemTargetLabels } from '../hooks/use-menu-item-target-labels';
import { MenuItemRow } from './menu-item-row';
import { MenuItemEditorDialog } from './menu-item-editor-dialog';
import {
  findParentId,
  getSiblings,
  moveItem,
  toReorderPayload,
} from '../utils/menu-item-tree.util';
import type { MenuItemFormValues } from '../schemas/menu-item.schema';
import type { MenuItem } from '../types/menu';

export interface MenuItemTreeProps {
  menuId: string;
  items: MenuItem[];
}

function toApiInput(values: MenuItemFormValues) {
  return {
    label: values.label,
    targetType: values.targetType,
    pageId: values.targetType === 'PAGE' ? values.pageId || undefined : undefined,
    articleId: values.targetType === 'ARTICLE' ? values.articleId || undefined : undefined,
    categoryId: values.targetType === 'CATEGORY' ? values.categoryId || undefined : undefined,
    url:
      values.targetType === 'EXTERNAL_URL' || values.targetType === 'CUSTOM_URL'
        ? values.url || undefined
        : undefined,
    openMode: values.openMode,
    parentId: values.parentId || undefined,
    icon: values.icon || undefined,
    cssClass: values.cssClass || undefined,
  };
}

/**
 * The visual menu tree editor — one `DndContext` for the whole tree
 * (nested `SortableContext`s per level inside `MenuItemRow`, same
 * dnd-kit-supported pattern the Block Editor already uses, §B.2).
 * Every structural change (drag, Move Up/Down, Indent/Outdent) computes
 * the resulting tree client-side with `moveItem`, then persists the
 * whole new structure in one `reorderMenuItems` call — the same
 * transaction the backend already validates cycles/ownership against
 * before writing anything (§A.2/A.7).
 */
export function MenuItemTree({ menuId, items }: MenuItemTreeProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const reorderMutation = useReorderMenuItems(menuId);
  const createMutation = useCreateMenuItem(menuId);
  const updateMutation = useUpdateMenuItem(menuId);
  const deleteMutation = useDeleteMenuItem(menuId);
  const { labels: targetLabels } = useMenuItemTargetLabels(items);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  function persist(nextTree: MenuItem[]) {
    reorderMutation.mutate(toReorderPayload(nextTree));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const overParentId = findParentId(items, overId);
    const siblings = getSiblings(items, overParentId);
    const overIndex = siblings.findIndex((item) => item.id === overId);
    if (overIndex === -1) return;
    persist(moveItem(items, activeId, overParentId, overIndex));
  }

  function handleMoveUp(id: string) {
    const parentId = findParentId(items, id);
    const siblings = getSiblings(items, parentId);
    const index = siblings.findIndex((item) => item.id === id);
    if (index <= 0) return;
    persist(moveItem(items, id, parentId, index - 1));
  }

  function handleMoveDown(id: string) {
    const parentId = findParentId(items, id);
    const siblings = getSiblings(items, parentId);
    const index = siblings.findIndex((item) => item.id === id);
    if (index === -1 || index >= siblings.length - 1) return;
    persist(moveItem(items, id, parentId, index + 1));
  }

  function handleIndent(id: string) {
    const parentId = findParentId(items, id);
    const siblings = getSiblings(items, parentId);
    const index = siblings.findIndex((item) => item.id === id);
    if (index <= 0) return;
    const newParent = siblings[index - 1];
    persist(moveItem(items, id, newParent.id, newParent.children.length));
  }

  function handleOutdent(id: string) {
    const parentId = findParentId(items, id);
    if (parentId === null) return;
    const grandParentId = findParentId(items, parentId);
    const parentSiblings = getSiblings(items, grandParentId);
    const parentIndex = parentSiblings.findIndex((item) => item.id === parentId);
    persist(moveItem(items, id, grandParentId, parentIndex + 1));
  }

  function openAddDialog(parentId: string | null) {
    setEditingItem(null);
    setDefaultParentId(parentId);
    setDialogOpen(true);
  }

  function openEditDialog(item: MenuItem) {
    setEditingItem(item);
    setDefaultParentId(null);
    setDialogOpen(true);
  }

  function handleSubmit(values: MenuItemFormValues) {
    const input = toApiInput(values);
    if (editingItem) {
      updateMutation.mutate(
        { itemId: editingItem.id, input },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(input, { onSuccess: () => setDialogOpen(false) });
    }
  }

  const topLevelIds = items.map((item) => item.id);

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <EmptyState
              title="No navigation items yet"
              description="Add a page, article, or link to start building this menu."
            />
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  depth={0}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  targetLabels={targetLabels}
                  onEdit={openEditDialog}
                  onDelete={setItemToDelete}
                  onAddChild={(parentId) => openAddDialog(parentId)}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onIndent={handleIndent}
                  onOutdent={handleOutdent}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" size="sm" onClick={() => openAddDialog(null)}>
        <Plus className="size-4" />
        Add item
      </Button>

      <MenuItemEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tree={items}
        editingItem={editingItem}
        defaultParentId={defaultParentId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete navigation item"
        description={
          itemToDelete && itemToDelete.children.length > 0
            ? `"${itemToDelete.label}" has nested items under it — remove or move those first.`
            : `Remove "${itemToDelete?.label}" from this navigation?`
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (itemToDelete) deleteMutation.mutate(itemToDelete.id);
        }}
      />
    </div>
  );
}
