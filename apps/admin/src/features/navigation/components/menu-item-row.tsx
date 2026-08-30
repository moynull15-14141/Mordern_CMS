'use client';

import { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GripVertical,
  IndentIncrease,
  IndentDecrease,
  ArrowUp,
  ArrowDown,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { MENU_ITEM_TARGET_TYPE_LABEL } from '../constants/menu.constants';
import type { MenuItem } from '../types/menu';

export interface MenuItemRowProps {
  item: MenuItem;
  depth: number;
  isFirst: boolean;
  isLast: boolean;
  targetLabels: Map<string, string>;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onAddChild: (parentId: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
}

function targetSummary(item: MenuItem, targetLabels: Map<string, string>): string {
  if (item.targetType === 'PAGE')
    return item.pageId ? (targetLabels.get(`PAGE:${item.pageId}`) ?? '…') : '—';
  if (item.targetType === 'ARTICLE')
    return item.articleId ? (targetLabels.get(`ARTICLE:${item.articleId}`) ?? '…') : '—';
  if (item.targetType === 'CATEGORY')
    return item.categoryId ? (targetLabels.get(`CATEGORY:${item.categoryId}`) ?? '…') : '—';
  return item.url ?? '—';
}

/**
 * One row per item, recursing into a nested `SortableContext` for its own
 * children — the same "tree via nested SortableContext" pattern the
 * Block Editor's `block-row.tsx` already established (§B.2), so this
 * reuses dnd-kit's real drag-and-drop rather than a second engine.
 * Move Up/Down/Indent/Outdent are real, independent, keyboard-reachable
 * buttons — drag-and-drop is never the only way to reorder.
 */
export function MenuItemRow({
  item,
  depth,
  isFirst,
  isLast,
  targetLabels,
  onEdit,
  onDelete,
  onAddChild,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent,
}: MenuItemRowProps) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const hasChildren = item.children.length > 0;
  const childIds = item.children.map((child) => child.id);
  const isExternal = item.targetType === 'EXTERNAL_URL' || item.targetType === 'CUSTOM_URL';

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('rounded-md border border-border bg-card', isDragging && 'opacity-50')}
    >
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${item.label}`}
          className="cursor-grab text-muted-foreground"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
          className={cn('text-muted-foreground', !hasChildren && 'invisible')}
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium">{item.label}</span>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {MENU_ITEM_TARGET_TYPE_LABEL[item.targetType]}
          </Badge>
          <span className="truncate text-xs text-muted-foreground">
            {targetSummary(item, targetLabels)}
          </span>
          {isExternal ? <ExternalLink className="size-3 shrink-0 text-muted-foreground" /> : null}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move ${item.label} up`}
            disabled={isFirst}
            onClick={() => onMoveUp(item.id)}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move ${item.label} down`}
            disabled={isLast}
            onClick={() => onMoveDown(item.id)}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Move ${item.label} out one level`}
            disabled={depth === 0}
            onClick={() => onOutdent(item.id)}
          >
            <IndentDecrease className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Nest ${item.label} under the item above it`}
            disabled={isFirst}
            onClick={() => onIndent(item.id)}
          >
            <IndentIncrease className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Add item under ${item.label}`}
            onClick={() => onAddChild(item.id)}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Edit ${item.label}`}
            onClick={() => onEdit(item)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete ${item.label}`}
            onClick={() => onDelete(item)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {hasChildren && expanded ? (
        <div className="space-y-2 border-t border-border p-2 pl-8">
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            {item.children.map((child, index) => (
              <MenuItemRow
                key={child.id}
                item={child}
                depth={depth + 1}
                isFirst={index === 0}
                isLast={index === item.children.length - 1}
                targetLabels={targetLabels}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onIndent={onIndent}
                onOutdent={onOutdent}
              />
            ))}
          </SortableContext>
        </div>
      ) : null}
    </div>
  );
}
