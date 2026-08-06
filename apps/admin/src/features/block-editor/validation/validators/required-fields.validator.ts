import type { BlockNode } from '../../types/block.types';
import type { ValidationIssue } from '../../types/editor.types';
import type { BlockFieldDescriptor } from '../../registry/block-definition.types';
import { getBlockDefinition } from '../../registry/block-registry';

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function checkFields(
  data: Record<string, unknown>,
  fields: BlockFieldDescriptor[],
  blockId: string,
  path: string,
  issues: ValidationIssue[]
): void {
  for (const field of fields) {
    const value = data[field.key];
    const fieldPath = `${path}.${field.key}`;

    if (field.required && isEmpty(value)) {
      issues.push({ blockId, path: fieldPath, message: `"${field.label}" is required.` });
      continue;
    }
    if (field.kind === 'list' && Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          checkFields(
            item as Record<string, unknown>,
            field.itemFields ?? [],
            blockId,
            `${fieldPath}[${index}]`,
            issues
          );
        }
      });
    }
  }
}

/** Mirrors the backend's required-field pass — walks `data` against the
 * registered `BlockDefinition.fields` (registry-driven, not a hardcoded
 * switch). Unknown-type nodes are skipped here (that's
 * `validateUnknownTypes`'s job) rather than double-reported. */
export function validateRequiredFields(blocks: BlockNode[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  function walk(nodes: BlockNode[], path: string) {
    nodes.forEach((node, index) => {
      const nodePath = `${path}[${index}]`;
      const definition = getBlockDefinition(node.type);
      if (definition) {
        checkFields(node.data ?? {}, definition.fields, node.id, `${nodePath}.data`, issues);
      }
      if (node.children) {
        walk(node.children, `${nodePath}.children`);
      }
    });
  }

  walk(blocks, 'blocks');
  return issues;
}
