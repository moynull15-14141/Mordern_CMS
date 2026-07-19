import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicLoading } from './public-loading';

describe('PublicLoading', () => {
  it('renders an accessible, announced loading status', () => {
    render(<PublicLoading />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'Loading');
  });
});
