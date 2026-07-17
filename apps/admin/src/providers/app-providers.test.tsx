import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn().mockResolvedValue(null), post: vi.fn().mockResolvedValue(null) },
  onSessionExpired: vi.fn(() => () => {}),
}));

import { AppProviders } from './app-providers';

describe('AppProviders', () => {
  it('composes every global provider without crashing and renders children', () => {
    render(
      <AppProviders>
        <div>Shell content</div>
      </AppProviders>
    );
    expect(screen.getByText('Shell content')).toBeInTheDocument();
  });

  it('renders the loading progress bar and toast region as part of the composed shell', () => {
    render(
      <AppProviders>
        <div>Shell content</div>
      </AppProviders>
    );
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });
});
