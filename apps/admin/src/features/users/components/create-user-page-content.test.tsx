import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateUserPageContent } from './create-user-page-content';
import { usersApi } from '../services/users.api';
import { ApiError } from '@/lib/api-error';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/users.api', () => ({ usersApi: { create: vi.fn() } }));
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

describe('CreateUserPageContent', () => {
  it('renders the page title and the create form', () => {
    render(<CreateUserPageContent />, { wrapper: wrapper() });
    expect(screen.getByRole('heading', { name: 'New user' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('creates a user and redirects to /users on success', async () => {
    vi.mocked(usersApi.create).mockResolvedValue({ id: 'u1' } as never);
    const user = userEvent.setup();
    render(<CreateUserPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() => expect(usersApi.create).toHaveBeenCalled());
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/users'));
  });

  it('shows the backend ApiError message and does not redirect on failure', async () => {
    vi.mocked(usersApi.create).mockRejectedValue(
      new ApiError({ message: 'This email is already taken.', code: 'BUSINESS_CONFLICT', status: 409 }),
    );
    const user = userEvent.setup();
    render(<CreateUserPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Email'), 'dup@example.com');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() => expect(screen.getByText('This email is already taken.')).toBeInTheDocument());
    expect(pushMock).not.toHaveBeenCalled();
  });
});
