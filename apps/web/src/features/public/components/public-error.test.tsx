import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublicError } from './public-error';

describe('PublicError', () => {
  it('renders the message and optional detail', () => {
    render(<PublicError message="Something broke" detail="ref-123" />);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
    expect(screen.getByTestId('public-error-detail')).toHaveTextContent('ref-123');
  });

  it('omits the detail paragraph when none is given', () => {
    render(<PublicError message="Something broke" />);
    expect(screen.queryByTestId('public-error-detail')).not.toBeInTheDocument();
  });

  it('calls onRetry when the "Try again" button is clicked', async () => {
    const onRetry = vi.fn();
    render(<PublicError message="Something broke" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('omits the retry button when onRetry is not given', () => {
    render(<PublicError message="Something broke" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
