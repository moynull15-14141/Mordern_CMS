import type { CSSProperties } from 'react';
import type { BlockComponentProps } from '../types/block.types';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/** Size/weight stay static Tailwind classes — per-level `fontSize`/
 * `fontWeight`/`lineHeight` design tokens exist (`DesignTokenTypographyStylesDto`,
 * exposed as `--sportingspy-h1-font-size` etc.) but aren't applied here yet:
 * a CSS var with no safe, size-appropriate fallback per level would either
 * need one real value per Tailwind class duplicated in this file, or risk
 * silently un-sizing headings for every theme that hasn't set that specific
 * token. Color is never hardcoded, though — `--sportingspy-color-text`
 * (Milestone 8: theme-driven; Milestone 13.1: static `globals.css` default
 * for a pre-M8 theme), matching "Do not hardcode colors inside individual
 * block components." See the Milestone 8 report's "Known Limitations." */
const LEVEL_CLASSES: Record<string, string> = {
  '1': 'text-4xl font-bold tracking-tight',
  '2': 'text-3xl font-bold tracking-tight',
  '3': 'text-2xl font-semibold',
  '4': 'text-xl font-semibold',
  '5': 'text-lg font-semibold',
  '6': 'text-base font-semibold',
};

export function HeadingBlock({ block }: BlockComponentProps) {
  const text = typeof block.data.text === 'string' ? block.data.text : '';
  const level =
    typeof block.data.level === 'string' && LEVEL_CLASSES[block.data.level]
      ? block.data.level
      : '2';
  if (!text) return null;

  const Tag = `h${level}` as HeadingTag;
  const style: CSSProperties = {
    color: 'var(--sportingspy-color-text)',
    fontFamily: 'var(--sportingspy-font-family-heading, var(--sportingspy-font-family))',
  };
  return (
    <Tag className={LEVEL_CLASSES[level]} style={style}>
      {text}
    </Tag>
  );
}
