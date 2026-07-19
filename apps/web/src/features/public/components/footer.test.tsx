import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './footer';
import type { PublicNavigationMenus } from '../types/render-context.types';

const emptyMenus: PublicNavigationMenus = { header: null, footer: null, secondary: null };

describe('Footer', () => {
  it('renders the site name and tagline from settings', () => {
    render(
      <Footer
        menus={emptyMenus}
        settings={[
          { key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' },
          { key: 'general.siteTagline', label: 'Tagline', value: 'All the scores' },
        ]}
      />
    );
    expect(screen.getByText('SportingSpy')).toBeInTheDocument();
    expect(screen.getByText('All the scores')).toBeInTheDocument();
  });

  it('renders a copyright line with the current year when siteName is present', () => {
    render(
      <Footer
        menus={emptyMenus}
        settings={[{ key: 'general.siteName', label: 'Site Name', value: 'SportingSpy' }]}
      />
    );
    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()} SportingSpy`))
    ).toBeInTheDocument();
  });

  it('renders nothing site-name-related when settings is null', () => {
    const { container } = render(<Footer menus={emptyMenus} settings={null} />);
    expect(container.textContent).not.toContain('©');
  });
});
