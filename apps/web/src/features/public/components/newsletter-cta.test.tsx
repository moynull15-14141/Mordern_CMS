import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsletterCta } from './newsletter-cta';

describe('NewsletterCta', () => {
  it('renders a disabled email input and submit button (no real backend endpoint to submit to)', () => {
    render(<NewsletterCta />);
    expect(screen.getByLabelText('Email address')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeDisabled();
  });

  it('renders no form action (never pretends to submit anywhere)', () => {
    const { container } = render(<NewsletterCta />);
    const form = container.querySelector('form');
    expect(form).not.toHaveAttribute('action');
  });

  it('discloses that signup is not yet available', () => {
    render(<NewsletterCta />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
