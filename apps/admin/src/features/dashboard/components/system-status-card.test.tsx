import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemStatusCard } from './system-status-card';

describe('SystemStatusCard', () => {
  it('renders the card title', () => {
    render(<SystemStatusCard />);
    expect(screen.getByText('System Status')).toBeInTheDocument();
  });

  it('states explicitly that status checks are not yet available', () => {
    render(<SystemStatusCard />);
    expect(screen.getByText('Status checks are not yet available.')).toBeInTheDocument();
  });
});
