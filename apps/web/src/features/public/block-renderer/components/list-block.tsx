import type { BlockComponentProps } from '../types/block.types';

interface ListItem {
  text?: unknown;
}

export function ListBlock({ block }: BlockComponentProps) {
  const items = Array.isArray(block.data.items) ? (block.data.items as ListItem[]) : [];
  const style = block.data.style === 'ordered' ? 'ordered' : 'unordered';
  const texts = items
    .map((item) => (typeof item.text === 'string' ? item.text : ''))
    .filter((text) => text.length > 0);
  if (texts.length === 0) return null;

  const Tag = style === 'ordered' ? 'ol' : 'ul';
  return (
    <Tag
      className={`my-2 space-y-1 pl-6 text-gray-700 ${style === 'ordered' ? 'list-decimal' : 'list-disc'}`}
    >
      {texts.map((text, index) => (
        <li key={index}>{text}</li>
      ))}
    </Tag>
  );
}
