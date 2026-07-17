import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';

const { useLoginMock } = vi.hoisted(() => ({ useLoginMock: vi.fn() }));
vi.mock('@/features/auth/hooks/use-login', () => ({
  useLogin: () => useLoginMock(),
}));

describe('LoginPage', () => {
  it('renders the LoginForm', () => {
    useLoginMock.mockReturnValue({
      mutate: vi.fn(),
      isError: false,
      error: null,
      isPending: false,
    });
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
