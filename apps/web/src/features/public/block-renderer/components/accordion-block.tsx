import type { BlockComponentProps } from '../types/block.types';
import { renderBlockList } from '../render-block-list';
import { groupChildrenByMetaKey } from '../utils/group-children.util';

interface Panel {
  title?: unknown;
}

/**
 * Native `<details>`/`<summary>` — no client JS needed for open/close
 * state, works with JavaScript disabled, matches this app's preference
 * for server-rendered-first interactivity (`ThemeSearch`'s doc comment:
 * "native ... — no client JS"). `Tabs` (the sibling container type) has
 * no equivalent native element, so it's the one container that needs
 * `'use client'`.
 */
export function AccordionBlock({ block }: BlockComponentProps) {
  const panels = Array.isArray(block.data.panels) ? (block.data.panels as Panel[]) : [];
  const grouped = groupChildrenByMetaKey(block.children, 'panelId');
  if (panels.length === 0) return null;

  return (
    <div className="my-2 divide-y divide-gray-200 rounded-[var(--sportingspy-radius,0.5rem)] border border-gray-200">
      {panels.map((panel, index) => {
        const title = typeof panel.title === 'string' ? panel.title : `Panel ${index + 1}`;
        const panelChildren = grouped.get(index) ?? [];
        return (
          <details key={index} className="group px-4 py-3">
            <summary className="cursor-pointer list-none font-medium text-gray-900 marker:hidden">
              {title}
            </summary>
            <div className="mt-3 space-y-3">{renderBlockList(panelChildren)}</div>
          </details>
        );
      })}
    </div>
  );
}
