import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileCard } from './profile-card';
import type { User } from '@/features/users';

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

describe('ProfileCard', () => {
  it('renders the display name, email, and status', () => {
    render(<ProfileCard user={makeUser()} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders "Never" for lastLoginAt when null', () => {
    render(<ProfileCard user={makeUser({ lastLoginAt: null })} />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('renders a formatted lastLoginAt when present', () => {
    render(<ProfileCard user={makeUser({ lastLoginAt: '2026-01-05T10:00:00.000Z' })} />);
    expect(screen.queryByText('Never')).not.toBeInTheDocument();
  });

  it('renders profile.bio when present', () => {
    render(<ProfileCard user={makeUser({ profile: { bio: 'Hello world' } })} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('does not render a Roles/Permissions section (no backend data source)', () => {
    render(<ProfileCard user={makeUser()} />);
    expect(screen.queryByText(/permission/i)).not.toBeInTheDocument();
  });

  it('does not render the Remove avatar button when onRemoveAvatar is not given', () => {
    render(<ProfileCard user={makeUser()} />);
    expect(screen.queryByRole('button', { name: 'Remove avatar' })).not.toBeInTheDocument();
  });

  it('calls onRemoveAvatar when the Remove avatar button is clicked', async () => {
    const onRemoveAvatar = vi.fn();
    const user = userEvent.setup();
    render(<ProfileCard user={makeUser()} onRemoveAvatar={onRemoveAvatar} />);

    await user.click(screen.getByRole('button', { name: 'Remove avatar' }));
    expect(onRemoveAvatar).toHaveBeenCalled();
  });
});
