import { describe, expect, it } from 'vitest';
import { copyToClipboard, duplicateBlock, pasteFromClipboard } from './clipboard';
import type { BlockNode } from '../types/block.types';

const block: BlockNode = { id: 'a', type: 'paragraph', data: { text: 'hi' } };

describe('clipboard', () => {
  it('copyToClipboard wraps the block as-is', () => {
    expect(copyToClipboard(block)).toEqual({ block });
  });

  it('pasteFromClipboard returns a fresh-id clone, preserving data', () => {
    const entry = copyToClipboard(block);
    const pasted = pasteFromClipboard(entry);
    expect(pasted.id).not.toBe('a');
    expect(pasted.data).toEqual({ text: 'hi' });
  });

  it('pasting the same entry twice never produces duplicate ids', () => {
    const entry = copyToClipboard(block);
    const first = pasteFromClipboard(entry);
    const second = pasteFromClipboard(entry);
    expect(first.id).not.toBe(second.id);
  });

  it('duplicateBlock returns a fresh-id clone', () => {
    const duplicate = duplicateBlock(block);
    expect(duplicate.id).not.toBe('a');
    expect(duplicate.data).toEqual({ text: 'hi' });
  });
});
