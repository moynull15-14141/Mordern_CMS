import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FolderTree } from './folder-tree';
import type { MediaFolderTreeNode } from '../types/media';

function makeNode(overrides: Partial<MediaFolderTreeNode> = {}): MediaFolderTreeNode {
  return {
    id: 'f1',
    name: 'Photos',
    slug: 'photos',
    parentId: null,
    childrenCount: 0,
    assetCount: 3,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    children: [],
    ...overrides,
  };
}

describe('FolderTree', () => {
  it('renders "All media" and calls onSelect(undefined) when clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FolderTree nodes={[makeNode()]} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'All media' }));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });

  it('renders top-level folders expanded by default with their asset count', () => {
    const child = makeNode({ id: 'f2', name: 'Vacation', assetCount: 1 });
    render(<FolderTree nodes={[makeNode({ children: [child] })]} onSelect={vi.fn()} />);

    expect(screen.getByText('Photos')).toBeInTheDocument();
    expect(screen.getByText('Vacation')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onSelect with the folder id when a folder row is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FolderTree nodes={[makeNode()]} onSelect={onSelect} />);

    await user.click(screen.getByText('Photos'));
    expect(onSelect).toHaveBeenCalledWith('f1');
  });

  it('collapses/expands a folder with children via its chevron', async () => {
    const child = makeNode({ id: 'f2', name: 'Vacation' });
    const user = userEvent.setup();
    render(<FolderTree nodes={[makeNode({ children: [child] })]} onSelect={vi.fn()} />);

    expect(screen.getByText('Vacation')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Collapse Photos' }));
    expect(screen.queryByText('Vacation')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Expand Photos' }));
    expect(screen.getByText('Vacation')).toBeInTheDocument();
  });

  it('highlights the selected folder', () => {
    render(<FolderTree nodes={[makeNode()]} selectedId="f1" onSelect={vi.fn()} />);
    expect(screen.getByText('Photos').closest('button')?.parentElement).toHaveClass('bg-accent');
  });
});
