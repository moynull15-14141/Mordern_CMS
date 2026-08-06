import type { BlockComponentProps } from '../types/block.types';

const TONE_CLASSES: Record<string, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
};

export function CalloutBlock({ block }: BlockComponentProps) {
  const title = typeof block.data.title === 'string' ? block.data.title : '';
  const text = typeof block.data.text === 'string' ? block.data.text : '';
  const tone =
    typeof block.data.tone === 'string' && TONE_CLASSES[block.data.tone] ? block.data.tone : 'info';
  if (!text) return null;

  return (
    <div
      className={`my-2 rounded-[var(--sportingspy-radius,0.5rem)] border p-4 ${TONE_CLASSES[tone]}`}
    >
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <p className="text-sm">{text}</p>
    </div>
  );
}
