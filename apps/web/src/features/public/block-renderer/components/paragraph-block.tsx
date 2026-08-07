import type { BlockComponentProps } from '../types/block.types';

/** Color/font-family read the real theme tokens (Milestone 8) —
 * `--sportingspy-color-text-secondary` falls back to
 * `--sportingspy-color-text` (Milestone 13.1's static default) when a
 * theme hasn't set the newer, more specific token. */
export function ParagraphBlock({ block }: BlockComponentProps) {
  const text = typeof block.data.text === 'string' ? block.data.text : '';
  if (!text) return null;
  return (
    <p
      className="text-base leading-7"
      style={{
        color: 'var(--sportingspy-color-text-secondary, var(--sportingspy-color-text))',
        fontFamily: 'var(--sportingspy-font-family)',
      }}
    >
      {text}
    </p>
  );
}
