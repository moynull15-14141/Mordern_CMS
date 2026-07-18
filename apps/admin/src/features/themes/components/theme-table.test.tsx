import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeTable } from './theme-table';
import type { Theme } from '../types/theme';

function makeTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    id: 't1',
    name: 'Classic',
    slug: 'classic',
    version: null,
    author: null,
    description: null,
    thumbnail: null,
    status: 'DRAFT',
    isActive: false,
    settings: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makeTheme()],
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
  onActivate: vi.fn(),
};

describe('ThemeTable', () => {
  it('renders name, slug, and status', () => {
    render(<ThemeTable {...baseProps} />);
    expect(screen.getByText('Classic')).toBeInTheDocument();
    expect(screen.getByText('classic')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows an Active badge for the active theme', () => {
    render(<ThemeTable {...baseProps} data={[makeTheme({ isActive: true })]} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Edit/Activate/Delete actions for a non-deleted, non-active theme', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ThemeTable {...baseProps} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Classic' }));
    expect(screen.getByRole('menuitem', { name: 'Activate' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('does not show Activate for an already-active theme', async () => {
    const user = userEvent.setup();
    render(<ThemeTable {...baseProps} data={[makeTheme({ isActive: true })]} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Classic' }));
    expect(screen.queryByRole('menuitem', { name: 'Activate' })).not.toBeInTheDocument();
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted theme', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makeTheme({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<ThemeTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Classic' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 't1' }));
  });

  it('renders the empty state when there are no themes', () => {
    render(<ThemeTable {...baseProps} data={[]} />);
    expect(screen.getByText('No themes yet')).toBeInTheDocument();
  });
});
