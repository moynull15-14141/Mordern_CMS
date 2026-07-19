import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeSection } from './theme-section';

describe('ThemeSection', () => {
  it('renders a heading when title is given', () => {
    render(
      <ThemeSection title="Latest Articles">
        <p>body</p>
      </ThemeSection>
    );
    expect(screen.getByRole('heading', { name: 'Latest Articles' })).toBeInTheDocument();
  });

  it('renders no heading when title is omitted', () => {
    render(
      <ThemeSection>
        <p>body</p>
      </ThemeSection>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('always renders children', () => {
    render(
      <ThemeSection>
        <p>body content</p>
      </ThemeSection>
    );
    expect(screen.getByText('body content')).toBeInTheDocument();
  });
});
