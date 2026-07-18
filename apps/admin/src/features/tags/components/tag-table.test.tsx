import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagTable } from './tag-table';
import type { Tag } from '../types/tag';

function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 't1',
    name: 'Breaking',
    slug: 'breaking',
    description: null,
    synonyms: null,
    usageCount: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makeTag()],
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

describe('TagTable', () => {
  it('renders name, slug, and usage count', () => {
    render(<TagTable {...baseProps} />);
    expect(screen.getByText('Breaking')).toBeInTheDocument();
    expect(screen.getByText('breaking')).toBeInTheDocument();
    expect(screen.getByText('3 articles')).toBeInTheDocument();
  });

  it('shows Edit/Delete actions for a non-deleted tag', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<TagTable {...baseProps} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Breaking' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted tag', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makeTag({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<TagTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Breaking' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('renders the empty state when there are no tags', () => {
    render(<TagTable {...baseProps} data={[]} />);
    expect(screen.getByText('No tags yet')).toBeInTheDocument();
  });
});
