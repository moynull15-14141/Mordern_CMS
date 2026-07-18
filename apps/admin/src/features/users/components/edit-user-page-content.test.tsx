import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditUserPageContent } from './edit-user-page-content';
import { usersApi } from '../services/users.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/users.api', () => ({ usersApi: { get: vi.fn(), update: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const targetUser = {
  id: 'u1',
  email: 'jane@example.com',
  username: 'jdoe',
  displayName: 'Jane Doe',
  status: 'ACTIVE' as const,
  profileImageId: null,
  lastLoginAt: null,
  locked: false,
  profile: null,
  preferences: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditUserPageContent', () => {
  it('loads the user by id and pre-fills the form', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(targetUser);
    render(<EditUserPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Username')).toHaveValue('jdoe'));
    expect(usersApi.get).toHaveBeenCalledWith('u1');
  });

  it('navigates to the detail page without a confirm dialog when Cancel is clicked and the form is clean', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(targetUser);
    const user = userEvent.setup();
    render(<EditUserPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Username')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledWith('/users/u1');
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('shows a discard-changes confirmation when Cancel is clicked with unsaved edits', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(targetUser);
    const user = userEvent.setup();
    render(<EditUserPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Display name')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Display name'), '!');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith('/users/u1');
  });

  it('saves changes and navigates to the detail page on success (pessimistic)', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(targetUser);
    vi.mocked(usersApi.update).mockResolvedValue({ ...targetUser, displayName: 'Jane Smith' });
    const user = userEvent.setup();
    render(<EditUserPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Display name')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Display name'));
    await user.type(screen.getByLabelText('Display name'), 'Jane Smith');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(usersApi.update).toHaveBeenCalledWith('u1', { username: 'jdoe', displayName: 'Jane Smith' }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/users/u1'));
  });
});
