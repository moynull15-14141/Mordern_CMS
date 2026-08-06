import type { BlockNode } from '../../types/block.types';
import type { ValidationIssue } from '../../types/editor.types';
import { MAX_BLOCKS_PER_TREE } from '../constants';

function countBlocks(nodes: BlockNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + (node.children ? countBlocks(node.children) : 0),
    0
  );
}

export function validateMaxCount(blocks: BlockNode[]): ValidationIssue[] {
  const total = countBlocks(blocks);
  if (total > MAX_BLOCKS_PER_TREE) {
    return [
      {
        blockId: 'root',
        path: 'blocks',
        message: `Too many blocks (${total}) — exceeds the ${MAX_BLOCKS_PER_TREE}-block limit.`,
      },
    ];
  }
  return [];
}
