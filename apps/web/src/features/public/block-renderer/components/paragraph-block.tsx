import type { BlockComponentProps } from '../types/block.types';

export function ParagraphBlock({ block }: BlockComponentProps) {
  const text = typeof block.data.text === 'string' ? block.data.text : '';
  if (!text) return null;
  return <p className="text-base leading-7 text-gray-700">{text}</p>;
}
