import type { BlockComponentProps } from '../types/block.types';
import { renderBlockList } from '../render-block-list';
import { groupChildrenByMetaKey } from '../utils/group-children.util';

const GRID_CLASSES: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-3',
  '4': 'sm:grid-cols-4',
};

export function ColumnsBlock({ block }: BlockComponentProps) {
  const columnCount =
    typeof block.data.columnCount === 'string' && GRID_CLASSES[block.data.columnCount]
      ? block.data.columnCount
      : '2';
  const grouped = groupChildrenByMetaKey(block.children, 'column');
  const count = Number(columnCount);

  return (
    <div className={`my-2 grid grid-cols-1 gap-6 ${GRID_CLASSES[columnCount]}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3">
          {renderBlockList(grouped.get(index) ?? [])}
        </div>
      ))}
    </div>
  );
}
