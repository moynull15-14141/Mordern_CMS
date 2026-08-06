import type { BlockComponentProps } from '../types/block.types';

/** No syntax-highlighting library exists anywhere in this codebase
 * (confirmed: no `prismjs`/`shiki`/`highlight.js` in `apps/web/package.json`)
 * — renders a plain, semantically-correct `<pre><code>` block with the
 * language exposed as a `data-language` attribute (a real hook for a
 * future highlighting pass, not a fabricated "highlighted" look). Adding
 * one is real, separate scope beyond this block-rendering milestone. */
export function CodeBlockBlock({ block }: BlockComponentProps) {
  const code = typeof block.data.code === 'string' ? block.data.code : '';
  const language = typeof block.data.language === 'string' ? block.data.language : undefined;
  if (!code) return null;

  return (
    <pre
      className="my-2 overflow-x-auto rounded-[var(--sportingspy-radius,0.5rem)] bg-gray-900 p-4 text-sm text-gray-100"
      data-language={language}
    >
      <code>{code}</code>
    </pre>
  );
}
