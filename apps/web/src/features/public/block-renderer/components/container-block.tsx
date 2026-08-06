import type { BlockComponentProps } from '../types/block.types';
import { renderBlockList } from '../render-block-list';

const MAX_WIDTH_CLASSES: Record<string, string> = {
  narrow: 'max-w-2xl',
  normal: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-none',
};

const PADDING_CLASSES: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-10',
};

export function ContainerBlock({ block }: BlockComponentProps) {
  const maxWidth =
    typeof block.data.maxWidth === 'string' && MAX_WIDTH_CLASSES[block.data.maxWidth]
      ? block.data.maxWidth
      : 'normal';
  const padding =
    typeof block.data.padding === 'string' && PADDING_CLASSES[block.data.padding]
      ? block.data.padding
      : 'md';
  const background = typeof block.data.background === 'string' ? block.data.background : undefined;

  return (
    <div
      className={`my-2 mx-auto space-y-3 rounded-[var(--sportingspy-radius,0.5rem)] ${MAX_WIDTH_CLASSES[maxWidth]} ${PADDING_CLASSES[padding]}`}
      style={background ? { backgroundColor: background } : undefined}
    >
      {renderBlockList(block.children)}
    </div>
  );
}
