import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReusableBlockTable } from './reusable-block-table';
import type { ReusableBlock } from '../types/reusable-block';

function makeBlock(overrides: Partial<ReusableBlock> = {}): ReusableBlock {
  return {
    id: 'rb-1',
    name: 'Newsletter callout',
    description: null,
    category: null,
    blockType: 'callout',
    data: { title: '', text: 'Subscribe today', tone: 'info' },
    children: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makeBlock()],
  onPageChange: vi.fn(),
  onLimitChange: vi.fn(),
  sorting: [],
  onSortingChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDuplicate: vi.fn(),
  onDelete: vi.fn(),
  onRestore: vi.fn(),
};

describe('ReusableBlockTable', () => {
  it('renders name, type, and an inline content preview', () => {
    render(<ReusableBlockTable {...baseProps} />);
    expect(screen.getByText('Newsletter callout')).toBeInTheDocument();
    expect(screen.getByText('Callout')).toBeInTheDocument();
    expect(screen.getByText('Subscribe today')).toBeInTheDocument();
  });

  it('shows View/Edit/Duplicate/Delete actions for an active block', async () => {
    const onDuplicate = vi.fn();
    const user = userEvent.setup();
    render(<ReusableBlockTable {...baseProps} onDuplicate={onDuplicate} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Newsletter callout' }));
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(onDuplicate).toHaveBeenCalledWith(expect.objectContaining({ id: 'rb-1' }));
  });

  it('shows Restore instead of Edit/Duplicate/Delete for a soft-deleted block', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makeBlock({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<ReusableBlockTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Newsletter callout' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'rb-1' }));
  });

  it('renders the empty state when there are no reusable blocks', () => {
    render(<ReusableBlockTable {...baseProps} data={[]} />);
    expect(screen.getByText('No reusable blocks yet')).toBeInTheDocument();
  });
});
