import { describe, expect, it } from 'vitest';
import { runValidation } from './validation-pipeline';
import type { BlockNode } from '../types/block.types';
import type { ValidationIssue } from '../types/editor.types';

describe('runValidation', () => {
  it('returns no issues for a valid tree', () => {
    const blocks: BlockNode[] = [{ id: 'b1', type: 'paragraph', data: { text: 'hi' } }];
    expect(runValidation(blocks)).toEqual([]);
  });

  it('collects issues from every built-in rule across the whole tree', () => {
    const blocks: BlockNode[] = [
      { id: 'b1', type: 'paragraph', data: {} }, // missing required text
      { id: 'b2', type: 'not-a-real-type', data: {} }, // unknown type
    ];
    const issues = runValidation(blocks);
    expect(issues.some((issue) => issue.blockId === 'b1')).toBe(true);
    expect(issues.some((issue) => issue.blockId === 'b2')).toBe(true);
  });

  it('runs extraValidators alongside the built-ins, without modifying this module', () => {
    const customRule = (blocks: BlockNode[]): ValidationIssue[] =>
      blocks.map((block) => ({
        blockId: block.id,
        path: 'blocks',
        message: 'Custom rule triggered.',
      }));

    const blocks: BlockNode[] = [{ id: 'b1', type: 'paragraph', data: { text: 'hi' } }];
    const issues = runValidation(blocks, [customRule]);
    expect(issues).toContainEqual({
      blockId: 'b1',
      path: 'blocks',
      message: 'Custom rule triggered.',
    });
  });
});
