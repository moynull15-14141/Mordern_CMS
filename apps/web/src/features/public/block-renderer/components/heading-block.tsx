import type { BlockComponentProps } from '../types/block.types';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const LEVEL_CLASSES: Record<string, string> = {
  '1': 'text-4xl font-bold tracking-tight text-gray-900',
  '2': 'text-3xl font-bold tracking-tight text-gray-900',
  '3': 'text-2xl font-semibold text-gray-900',
  '4': 'text-xl font-semibold text-gray-900',
  '5': 'text-lg font-semibold text-gray-900',
  '6': 'text-base font-semibold text-gray-900',
};

export function HeadingBlock({ block }: BlockComponentProps) {
  const text = typeof block.data.text === 'string' ? block.data.text : '';
  const level =
    typeof block.data.level === 'string' && LEVEL_CLASSES[block.data.level]
      ? block.data.level
      : '2';
  if (!text) return null;

  const Tag = `h${level}` as HeadingTag;
  return <Tag className={LEVEL_CLASSES[level]}>{text}</Tag>;
}
