import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockRenderer } from './block-renderer';
import type { BlockNode } from './types/block.types';

describe('BlockRenderer', () => {
  it('renders a list of blocks inside a stable test hook', () => {
    const blocks: BlockNode[] = [{ id: 'b1', type: 'paragraph', data: { text: 'Hello world' } }];
    render(<BlockRenderer blocks={blocks} />);
    expect(screen.getByTestId('block-renderer')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders an empty container for an empty block list', () => {
    render(<BlockRenderer blocks={[]} />);
    expect(screen.getByTestId('block-renderer')).toBeEmptyDOMElement();
  });
});
