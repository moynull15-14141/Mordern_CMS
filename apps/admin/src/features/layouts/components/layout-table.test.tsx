import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LayoutTable } from './layout-table';
import type { Layout } from '../types/layout';

function makeLayout(overrides: Partial<Layout> = {}): Layout {
  return {
    id: 'l1',
    name: 'Default',
    slug: 'default',
    status: 'DRAFT',
    layoutPreset: 'sidebar-left',
    themeId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makeLayout()],
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
  onAssign: vi.fn(),
};

describe('LayoutTable', () => {
  it('renders name, slug, preset label, and status', () => {
    render(<LayoutTable {...baseProps} />);
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('Sidebar Left')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows Edit/Assign/Delete actions for a non-deleted layout', async () => {
    const onEdit = vi.fn();
    const onAssign = vi.fn();
    const user = userEvent.setup();
    render(<LayoutTable {...baseProps} onEdit={onEdit} onAssign={onAssign} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Default' }));
    await user.click(screen.getByRole('menuitem', { name: 'Assign to…' }));
    expect(onAssign).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1' }));

    await user.click(screen.getByRole('button', { name: 'Actions for Default' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1' }));
  });

  it('shows Restore instead of Edit/Assign/Delete for a soft-deleted layout', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makeLayout({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<LayoutTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Default' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1' }));
  });

  it('renders the empty state when there are no layouts', () => {
    render(<LayoutTable {...baseProps} data={[]} />);
    expect(screen.getByText('No layouts yet')).toBeInTheDocument();
  });
});
