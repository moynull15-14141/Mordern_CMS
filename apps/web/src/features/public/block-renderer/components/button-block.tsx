import type { BlockComponentProps } from '../types/block.types';
import { isSafeHref } from '../utils/safe-url.util';

const STYLE_CLASSES: Record<string, string> = {
  primary: 'bg-[var(--sportingspy-color-primary)] text-white hover:opacity-90',
  secondary:
    'bg-[var(--sportingspy-color-surface)] text-gray-900 border border-[var(--sportingspy-color-border)] hover:border-[var(--sportingspy-color-primary)]',
  outline:
    'border border-[var(--sportingspy-color-primary)] text-[var(--sportingspy-color-primary)] hover:bg-[var(--sportingspy-color-primary)] hover:text-white',
  ghost: 'text-[var(--sportingspy-color-primary)] hover:underline',
};

export function ButtonBlock({ block }: BlockComponentProps) {
  const label = typeof block.data.label === 'string' ? block.data.label : '';
  const url = typeof block.data.url === 'string' ? block.data.url : '';
  const style =
    typeof block.data.style === 'string' && STYLE_CLASSES[block.data.style]
      ? block.data.style
      : 'primary';
  const openInNewTab = block.data.openInNewTab === true;
  if (!label || !url || !isSafeHref(url)) return null;

  return (
    <div className="my-2">
      <a
        href={url}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={`inline-flex items-center rounded-[var(--sportingspy-radius,0.5rem)] px-5 py-2.5 text-sm font-semibold transition ${STYLE_CLASSES[style]}`}
      >
        {label}
      </a>
    </div>
  );
}
