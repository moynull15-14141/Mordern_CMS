import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderBlockList } from './render-block-list';
import type { BlockNode } from './types/block.types';

describe('renderBlockList', () => {
  it('returns null for an empty or undefined list', () => {
    expect(renderBlockList(undefined)).toBeNull();
    expect(renderBlockList([])).toBeNull();
  });

  it('dispatches each node to its registered component via a registry lookup, not a type-specific branch', () => {
    const blocks: BlockNode[] = [
      { id: 'b1', type: 'paragraph', data: { text: 'Hello' } },
      { id: 'b2', type: 'divider', data: {} },
      { id: 'b3', type: 'heading', data: { text: 'Title', level: '3' } },
    ];
    render(<div>{renderBlockList(blocks)}</div>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Title', level: 3 })).toBeInTheDocument();
  });

  it('silently skips a node whose type has no registered component', () => {
    const blocks: BlockNode[] = [{ id: 'b1', type: 'not-a-real-type' as never, data: {} }];
    const { container } = render(<div>{renderBlockList(blocks)}</div>);
    expect(container.textContent).toBe('');
  });
});
