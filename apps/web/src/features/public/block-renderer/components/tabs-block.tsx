'use client';

import { useState } from 'react';
import type { BlockComponentProps } from '../types/block.types';
import { renderBlockList } from '../render-block-list';
import { groupChildrenByMetaKey } from '../utils/group-children.util';

interface Tab {
  label?: unknown;
}

/** No native HTML element gives JS-free tabbed panels (unlike
 * `AccordionBlock`'s `<details>`), so this is the one block component in
 * the tree that needs `'use client'` — isolated to this single leaf
 * component, matching `ThemeButton`'s doc comment: "a future interactive
 * use case should wrap this in its own small `'use client'` component
 * rather than adding one here" (i.e. don't push client-ness up the tree). */
export function TabsBlock({ block }: BlockComponentProps) {
  const tabs = Array.isArray(block.data.tabs) ? (block.data.tabs as Tab[]) : [];
  const grouped = groupChildrenByMetaKey(block.children, 'tabId');
  const [activeIndex, setActiveIndex] = useState(0);

  if (tabs.length === 0) return null;

  return (
    <div className="my-2 rounded-[var(--sportingspy-radius,0.5rem)] border border-gray-200">
      <div role="tablist" className="flex border-b border-gray-200">
        {tabs.map((tab, index) => {
          const label = typeof tab.label === 'string' ? tab.label : `Tab ${index + 1}`;
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 text-sm font-medium ${
                isActive
                  ? 'border-b-2 border-[var(--sportingspy-color-primary)] text-[var(--sportingspy-color-primary)]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="space-y-3 p-4">
        {renderBlockList(grouped.get(activeIndex) ?? [])}
      </div>
    </div>
  );
}
