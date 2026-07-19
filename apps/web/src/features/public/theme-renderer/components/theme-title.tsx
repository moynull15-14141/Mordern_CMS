import type { ReactNode } from 'react';
import { createElement } from 'react';

const LEVEL_STYLES: Record<1 | 2 | 3 | 4, string> = {
  1: 'text-3xl font-bold tracking-tight text-[var(--sportingspy-color-text)] sm:text-4xl',
  2: 'text-2xl font-bold tracking-tight text-[var(--sportingspy-color-text)]',
  3: 'text-xl font-semibold text-[var(--sportingspy-color-text)]',
  4: 'text-base font-semibold text-[var(--sportingspy-color-text)]',
};

/** Themed heading — one place every heading level's size/weight is
 * defined, using the `--sportingspy-color-text` design-system token
 * (`styles/globals.css`) instead of a hardcoded gray shade. `level` picks
 * both the semantic tag (`h1`–`h4`) and its styling together, so a
 * renderer can never mismatch the two. */
export function ThemeTitle({
  level = 2,
  children,
  className,
}: {
  level?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  const tag = `h${level}`;
  const style = LEVEL_STYLES[level];
  return createElement(tag, { className: className ? `${style} ${className}` : style }, children);
}
