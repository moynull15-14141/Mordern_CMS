import type { BlockComponentProps } from '../types/block.types';

export function QuoteBlock({ block }: BlockComponentProps) {
  const text = typeof block.data.text === 'string' ? block.data.text : '';
  const citation = typeof block.data.citation === 'string' ? block.data.citation : '';
  if (!text) return null;

  return (
    <blockquote className="my-2 border-l-4 border-[var(--sportingspy-color-primary)] pl-4 italic text-gray-700">
      <p className="text-lg">{text}</p>
      {citation ? (
        <footer className="mt-2 text-sm not-italic text-gray-500">— {citation}</footer>
      ) : null}
    </blockquote>
  );
}
