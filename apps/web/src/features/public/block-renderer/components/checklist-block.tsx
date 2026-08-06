import type { BlockComponentProps } from '../types/block.types';

interface ChecklistItem {
  text?: unknown;
  checked?: unknown;
}

export function ChecklistBlock({ block }: BlockComponentProps) {
  const items = Array.isArray(block.data.items) ? (block.data.items as ChecklistItem[]) : [];
  const valid = items.filter(
    (item): item is { text: string; checked?: boolean } => typeof item.text === 'string'
  );
  if (valid.length === 0) return null;

  return (
    <ul className="my-2 space-y-2">
      {valid.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={item.checked === true}
            readOnly
            className="mt-1"
            aria-label={item.text}
          />
          <span className={item.checked === true ? 'line-through text-gray-400' : undefined}>
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
