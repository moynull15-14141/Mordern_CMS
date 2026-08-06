import type { BlockNode } from '../../types/block.types';
import type { ValidationIssue } from '../../types/editor.types';
import { getBlockDefinition } from '../../registry/block-registry';

/** Flags any node whose `type` has no registered `BlockDefinition` — the
 * registry-driven equivalent of the backend's `isKnownBlockType` check. A
 * type only becomes "known" by being registered (`registerBlockDefinition`),
 * so this rule automatically covers future builders' custom types too. */
export function validateUnknownTypes(blocks: BlockNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  function walk(nodes: BlockNode[], path: string) {
    nodes.forEach((node, index) => {
      const nodePath = `${path}[${index}]`;
      if (!getBlockDefinition(node.type)) {
        issues.push({
          blockId: node.id,
          path: nodePath,
          message: `Unknown block type "${node.type}".`,
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
