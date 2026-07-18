import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryTree } from './category-tree';
import type { CategoryTreeNode } from '../types/category';

function makeNode(overrides: Partial<CategoryTreeNode> = {}): CategoryTreeNode {
  return {
    id: 'c1',
    name: 'News',
    slug: 'news',
    description: null,
    status: 'ACTIVE',
    parentId: null,
    sortOrder: null,
    articleCount: 3,
    childrenCount: 0,
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    children: [],
    ...overrides,
  };
}

describe('CategoryTree', () => {
  it('renders top-level nodes with their article count', () => {
    render(<CategoryTree nodes={[makeNode()]} />);
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
  });

  it('does not render children until expanded, and shows them after clicking expand', async () => {
    const child = makeNode({ id: 'c2', name: 'Sports', parentId: 'c1' });
    const parent = makeNode({ children: [child] });
    const user = userEvent.setup();
    render(<CategoryTree nodes={[parent]} />);

    expect(screen.queryByText('Sports')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Expand News' }));
    expect(screen.getByText('Sports')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse News' }));
    expect(screen.queryByText('Sports')).not.toBeInTheDocument();
  });

  it('expands the path to currentId by default', () => {
    const child = makeNode({ id: 'c2', name: 'Sports', parentId: 'c1' });
    const parent = makeNode({ children: [child] });
    render(<CategoryTree nodes={[parent]} currentId="c2" />);

    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: /News/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks the current node as selected', () => {
    render(<CategoryTree nodes={[makeNode()]} currentId="c1" />);
    expect(screen.getByRole('treeitem')).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect with the clicked node', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CategoryTree nodes={[makeNode()]} onSelect={onSelect} />);

    await user.click(screen.getByText('News'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('renders nothing for an empty node list', () => {
    const { container } = render(<CategoryTree nodes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
