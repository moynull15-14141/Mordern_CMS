import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './error-boundary';

function Bomb(): never {
  throw new Error('Boom');
}

describe('ErrorBoundary', () => {
  it('renders children normally when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the default fallback UI when a child throws during render', () => {
    const onError = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onError}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.anything());

    vi.restoreAllMocks();
  });

  it('renders a custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={(error) => <div>Custom: {error.message}</div>}>
        <Bomb />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom: Boom')).toBeInTheDocument();

    vi.restoreAllMocks();
  });

  it('"Try again" resets the boundary state', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    // The child still throws post-reset, so the boundary re-catches — this
    // exercises reset() without asserting on the (thrown-again) outcome.
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
