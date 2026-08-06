import type { BlockComponentProps } from '../types/block.types';

const TONE_CLASSES: Record<string, string> = {
  info: 'border-blue-300 bg-blue-50 text-blue-900',
  success: 'border-green-300 bg-green-50 text-green-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
  critical: 'border-red-300 bg-red-50 text-red-900',
};

export function AlertBlock({ block }: BlockComponentProps) {
  const text = typeof block.data.text === 'string' ? block.data.text : '';
  const tone =
    typeof block.data.tone === 'string' && TONE_CLASSES[block.data.tone] ? block.data.tone : 'info';
  if (!text) return null;

  return (
    <div
      role="alert"
      className={`my-2 rounded-[var(--sportingspy-radius,0.5rem)] border-l-4 p-4 text-sm font-medium ${TONE_CLASSES[tone]}`}
    >
      {text}
    </div>
  );
}
