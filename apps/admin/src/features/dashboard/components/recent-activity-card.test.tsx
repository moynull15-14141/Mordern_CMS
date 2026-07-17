import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentActivityCard } from './recent-activity-card';

describe('RecentActivityCard', () => {
  it('renders the "No recent activity" empty state, never fabricated entries', () => {
    render(<RecentActivityCard />);
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('renders the card title', () => {
    render(<RecentActivityCard />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });
});
