import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FooterCta } from './footer-cta';

describe('FooterCta', () => {
  it('always renders a link to /blog', () => {
    render(<FooterCta settings={null} />);
    expect(screen.getByRole('link', { name: 'Visit the blog' })).toHaveAttribute('href', '/blog');
  });

  it('renders the admin email as a mailto link when the setting is present', () => {
    render(
      <FooterCta
        settings={[
          { key: 'general.adminEmail', label: 'Administrator Email', value: 'hello@example.com' },
        ]}
      />
    );
    const link = screen.getByRole('link', { name: 'hello@example.com' });
    expect(link).toHaveAttribute('href', 'mailto:hello@example.com');
  });

  it('omits the contact line entirely when no admin email setting exists', () => {
    render(<FooterCta settings={[]} />);
    expect(screen.queryByText(/Questions\?/)).not.toBeInTheDocument();
  });

  it('omits the contact line when settings is null (fetch failed)', () => {
    render(<FooterCta settings={null} />);
    expect(screen.queryByText(/Questions\?/)).not.toBeInTheDocument();
  });
});
