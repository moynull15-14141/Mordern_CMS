import type { BlockNode } from '../../types/block.types';
import type { ValidationIssue } from '../../types/editor.types';
import { isContainerBlockType } from '../../registry/block-registry';

/** Flags a leaf block that somehow carries `children` — mirrors the
 * backend's identical rule. Should be unreachable through the editor's
 * own UI (only container rows expose an "add child" action), but a
 * pasted/imported tree could carry it, so it's still checked. */
export function validateContainerChildren(blocks: BlockNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  function walk(nodes: BlockNode[], path: string) {
    nodes.forEach((node, index) => {
      const nodePath = `${path}[${index}]`;
      if (node.children && node.children.length > 0 && !isContainerBlockType(node.type)) {
        issues.push({
          blockId: node.id,
          path: nodePath,
          message: `Block type "${node.type}" cannot have children.`,
        });
      }
      if (node.children) {
        walk(node.children, `${nodePath}.children`);
      }
    });
  }

  walk(blocks, 'blocks');
  return issues;
}
