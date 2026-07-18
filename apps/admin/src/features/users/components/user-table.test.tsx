import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserTable } from './user-table';
import type { User } from '../types/user';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'jane@example.com',
    username: 'jdoe',
    displayName: 'Jane Doe',
    status: 'ACTIVE',
    profileImageId: null,
    lastLoginAt: null,
    locked: false,
    profile: null,
    preferences: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makeUser()],
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

describe('UserTable', () => {
  it('renders name, email, and status columns', () => {
    render(<UserTable {...baseProps} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('does not render a Roles column (no backend data source)', () => {
    render(<UserTable {...baseProps} />);
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
    expect(screen.queryByText('Role')).not.toBeInTheDocument();
  });

  it('falls back to username, then email, when displayName is null', () => {
    render(<UserTable {...baseProps} data={[makeUser({ displayName: null })]} />);
    expect(screen.getByText('jdoe')).toBeInTheDocument();
  });

  it('shows Edit/Delete actions for a non-deleted user and calls the right callback', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<UserTable {...baseProps} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Jane Doe' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
  });

  it('shows View action and calls onView', async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(<UserTable {...baseProps} onView={onView} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Jane Doe' }));
    await user.click(screen.getByRole('menuitem', { name: 'View' }));

    expect(onView).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
  });

  it('calls onDelete when Delete is clicked', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<UserTable {...baseProps} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Jane Doe' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted user', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deletedUser = makeUser({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<UserTable {...baseProps} data={[deletedUser]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Jane Doe' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
  });

  it('renders the empty state when there are no users', () => {
    render(<UserTable {...baseProps} data={[]} />);
    expect(screen.getByText('No users yet')).toBeInTheDocument();
  });

  it('forwards the filters slot into the table toolbar', () => {
    render(<UserTable {...baseProps} filters={<div>Status filter here</div>} />);
    expect(screen.getByText('Status filter here')).toBeInTheDocument();
  });
});
