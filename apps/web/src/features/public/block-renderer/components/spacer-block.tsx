import type { BlockComponentProps } from '../types/block.types';

const DEFAULT_HEIGHT = 40;
const MAX_HEIGHT = 400;

export function SpacerBlock({ block }: BlockComponentProps) {
  const raw = typeof block.data.height === 'number' ? block.data.height : DEFAULT_HEIGHT;
  const height = Math.min(Math.max(raw, 0), MAX_HEIGHT);
  return <div style={{ height }} aria-hidden />;
}
