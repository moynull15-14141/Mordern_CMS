import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageTable } from './page-table';
import type { Page } from '../types/page';

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'p1',
    title: 'About Us',
    slug: 'about-us',
    body: { text: 'x' },
    status: 'DRAFT',
    publishedAt: null,
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makePage()],
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

describe('PageTable', () => {
  it('renders title, slug, and status', () => {
    render(<PageTable {...baseProps} />);
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('about-us')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows Edit/Delete actions for a non-deleted page and calls the right callback', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<PageTable {...baseProps} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for About Us' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted page', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makePage({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<PageTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for About Us' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
  });

  it('renders the empty state when there are no pages', () => {
    render(<PageTable {...baseProps} data={[]} />);
    expect(screen.getByText('No pages yet')).toBeInTheDocument();
  });
});
