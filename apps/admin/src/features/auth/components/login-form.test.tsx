import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';
import { ApiError } from '@/lib/api-error';

const { mutateMock, useLoginMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  useLoginMock: vi.fn(),
}));

vi.mock('@/features/auth/hooks/use-login', () => ({
  useLogin: () => useLoginMock(),
}));

function setUseLoginReturn(overrides: Partial<ReturnType<typeof useLoginMock>> = {}) {
  useLoginMock.mockReturnValue({
    mutate: mutateMock,
    isError: false,
    error: null,
    isPending: false,
    ...overrides,
  });
}

describe('LoginForm', () => {
  it('renders email, password, remember me, and forgot-password link', () => {
    setUseLoginReturn();
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });

  it('shows a validation error and does not submit for an invalid email', async () => {
    setUseLoginReturn();
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'x');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('submits valid credentials', async () => {
    setUseLoginReturn();
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'secret',
        rememberMe: false,
      })
    );
  });

  it('includes rememberMe: true when the checkbox is checked', async () => {
    setUseLoginReturn();
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() =>
      expect(mutateMock).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'secret',
        rememberMe: true,
      })
    );
  });

  it('disables the submit button while the mutation is pending', () => {
    setUseLoginReturn({ isPending: true });
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  it('displays the backend ApiError message on failure', () => {
    setUseLoginReturn({
      isError: true,
      error: new ApiError({
        message: 'Invalid email or password',
        code: 'AUTH_INVALID_CREDENTIALS',
        status: 401,
      }),
    });
    render(<LoginForm />);
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('displays a generic message when the error is not an ApiError', () => {
    setUseLoginReturn({ isError: true, error: new Error('boom') });
    render(<LoginForm />);
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
  });

  it('shows no error alert before any submission', () => {
    setUseLoginReturn();
    render(<LoginForm />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
