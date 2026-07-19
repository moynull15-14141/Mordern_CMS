import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeError } from './theme-error';

describe('ThemeError', () => {
  it('renders the message as an alert', () => {
    render(<ThemeError message="Failed to load content." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load content.');
  });

  it('renders optional detail text when given', () => {
    render(<ThemeError message="Failed." detail="NETWORK_ERROR" />);
    expect(screen.getByText('NETWORK_ERROR')).toBeInTheDocument();
  });

  it('omits the retry button when onRetry is not given', () => {
    render(<ThemeError message="Failed." />);
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('invokes onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ThemeError message="Failed." onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
