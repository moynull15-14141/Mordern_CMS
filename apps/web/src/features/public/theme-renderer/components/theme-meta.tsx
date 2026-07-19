import type { ReactNode } from 'react';

export interface ThemeMetaItem {
  key: string;
  content: ReactNode;
}

/** Inline metadata row (author · date · reading time, etc.) — one place
 * the "·" separator convention lives, so every content type formats its
 * byline identically instead of each renderer re-implementing it. */
export function ThemeMeta({ items, className }: { items: ThemeMetaItem[]; className?: string }) {
  const visible = items.filter((item) => item.content !== null && item.content !== undefined);
  if (visible.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--sportingspy-color-muted)]${className ? ` ${className}` : ''}`}
    >
      {visible.map((item, index) => (
        <span key={item.key} className="flex items-center gap-x-3">
          {index > 0 ? <span aria-hidden>·</span> : null}
          {item.content}
        </span>
      ))}
    </div>
  );
}
