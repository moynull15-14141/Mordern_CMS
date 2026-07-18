'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { CategoryTreeNode } from '../types/category';

export interface CategoryTreeProps {
  nodes: CategoryTreeNode[];
  /** The node to highlight as "current" — its ancestors are highlighted
   * more subtly, and the path to it is expanded by default. */
  currentId?: string;
  onSelect?: (node: CategoryTreeNode) => void;
  renderActions?: (node: CategoryTreeNode) => ReactNode;
}

function findAncestorIds(nodes: CategoryTreeNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return path;
    const found = findAncestorIds(node.children, targetId, [...path, node.id]);
    if (found) return found;
  }
  return null;
}

/** Reusable recursive tree — `GET /categories/tree` (unlimited nesting).
 * Expand/collapse state is local (per mount); the path to `currentId` is
 * expanded by default so a detail/edit page always shows its own node. */
export function CategoryTree({ nodes, currentId, onSelect, renderActions }: CategoryTreeProps) {
  const ancestorIds = useMemo(
    () => new Set(currentId ? (findAncestorIds(nodes, currentId) ?? []) : []),
    [nodes, currentId],
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ancestorIds));

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (nodes.length === 0) return null;

  return (
    <ul role="tree" className="space-y-0.5">
      {nodes.map((node) => (
        <CategoryTreeItem
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          onToggle={toggle}
          ancestorIds={ancestorIds}
          currentId={currentId}
          onSelect={onSelect}
          renderActions={renderActions}
        />
      ))}
    </ul>
  );
}

interface CategoryTreeItemProps {
  node: CategoryTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  ancestorIds: Set<string>;
  currentId?: string;
  onSelect?: (node: CategoryTreeNode) => void;
  renderActions?: (node: CategoryTreeNode) => ReactNode;
}

function CategoryTreeItem({
  node,
  depth,
  expanded,
  onToggle,
  ancestorIds,
  currentId,
  onSelect,
  renderActions,
}: CategoryTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isCurrent = node.id === currentId;
  const isAncestor = ancestorIds.has(node.id);

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isCurrent}>
      <div
        className={cn(
          'flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm',
          isCurrent && 'bg-accent font-medium',
          isAncestor && !isCurrent && 'bg-accent/40',
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="flex size-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : (
          <span className="size-5 shrink-0" aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={() => onSelect?.(node)}
          className="flex flex-1 items-center gap-1.5 truncate text-left hover:underline"
        >
          <Folder className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{node.name}</span>
          <span className="ml-1 text-xs text-muted-foreground">({node.articleCount})</span>
        </button>

        {renderActions ? renderActions(node) : null}
      </div>

      {hasChildren && isExpanded ? (
        <ul role="group">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              ancestorIds={ancestorIds}
              currentId={currentId}
              onSelect={onSelect}
              renderActions={renderActions}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
