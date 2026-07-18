import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryTable } from './category-table';
import type { Category } from '../types/category';

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'c1',
    name: 'News',
    slug: 'news',
    description: null,
    status: 'ACTIVE',
    parentId: null,
    sortOrder: 1,
    articleCount: 5,
    childrenCount: 2,
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makeCategory()],
  onPageChange: vi.fn(),
  onLimitChange: vi.fn(),
  sorting: [],
  onSortingChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onRestore: vi.fn(),
};

describe('CategoryTable', () => {
  it('renders name, slug, status, article count, and children count', () => {
    render(<CategoryTable {...baseProps} />);
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('news')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows Edit/Delete actions for a non-deleted category', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<CategoryTable {...baseProps} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for News' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted category', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makeCategory({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<CategoryTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for News' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('renders the empty state when there are no categories', () => {
    render(<CategoryTable {...baseProps} data={[]} />);
    expect(screen.getByText('No categories yet')).toBeInTheDocument();
  });
});
