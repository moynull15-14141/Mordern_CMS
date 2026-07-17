import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from './error-state';
import { ApiError } from '@/lib/api-error';

describe('ErrorState', () => {
  it('shows a "Not found" placeholder for a not-found ApiError, with no retry button', () => {
    render(
      <ErrorState
        error={new ApiError({ message: 'x', code: 'BUSINESS_NOT_FOUND', status: 404 })}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText('Not found')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('shows a "permission" placeholder for a 403 ApiError, with no retry button', () => {
    render(
      <ErrorState
        error={new ApiError({ message: 'x', code: 'FORBIDDEN', status: 403 })}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText("You don't have permission")).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('shows a generic error placeholder with the ApiError message for other errors', () => {
    render(
      <ErrorState
        error={new ApiError({ message: 'Server exploded', code: 'SERVER_ERROR', status: 500 })}
      />
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Server exploded')).toBeInTheDocument();
  });

  it('renders a Retry button for a transient error when onRetry is given, and fires it', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <ErrorState
        error={new ApiError({ message: 'x', code: 'SERVER_ERROR', status: 500 })}
        onRetry={onRetry}
      />
    );
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('falls back to a generic message for a non-ApiError value', () => {
    render(<ErrorState error={new Error('boom')} />);
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });
});
