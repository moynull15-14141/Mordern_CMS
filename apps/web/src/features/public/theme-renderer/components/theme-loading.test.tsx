import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeLoading } from './theme-loading';

describe('ThemeLoading', () => {
  it('renders a polite, labeled loading status', () => {
    render(<ThemeLoading />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'Loading');
  });
});
