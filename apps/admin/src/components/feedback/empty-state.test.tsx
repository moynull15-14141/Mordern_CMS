import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    render(<EmptyState title="No results" description="Try a different search." />);
    expect(screen.getByText('Try a different search.')).toBeInTheDocument();
  });

  it('omits the description paragraph when none is given', () => {
    render(<EmptyState title="No results" />);
    expect(screen.queryByText('Try a different search.')).not.toBeInTheDocument();
  });

  it('renders an action button and fires its onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<EmptyState title="No results" action={{ label: 'Create one', onClick }} />);
    await user.click(screen.getByRole('button', { name: 'Create one' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders no action button when none is provided', () => {
    render(<EmptyState title="No results" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
