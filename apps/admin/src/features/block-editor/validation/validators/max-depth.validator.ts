import type { BlockNode } from '../../types/block.types';
import type { ValidationIssue } from '../../types/editor.types';
import { MAX_BLOCK_TREE_DEPTH } from '../constants';

export function validateMaxDepth(blocks: BlockNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  function walk(nodes: BlockNode[], path: string, depth: number) {
    nodes.forEach((node, index) => {
      const nodePath = `${path}[${index}]`;
      if (depth > MAX_BLOCK_TREE_DEPTH) {
        issues.push({
          blockId: node.id,
          path: nodePath,
          message: `Nesting too deep — exceeds the ${MAX_BLOCK_TREE_DEPTH}-level limit.`,
        });
      }
      if (node.children) {
        walk(node.children, `${nodePath}.children`, depth + 1);
      }
    });
  }

  walk(blocks, 'blocks', 1);
  return issues;
}
