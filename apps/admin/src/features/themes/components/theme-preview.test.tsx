import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemePreview } from './theme-preview';

describe('ThemePreview', () => {
  it('renders default placeholder header/footer text when nothing is set', () => {
    render(<ThemePreview settings={{}} />);
    expect(screen.getByTestId('theme-preview-header')).toHaveTextContent('Header');
    expect(screen.getByTestId('theme-preview-footer')).toHaveTextContent('Footer');
  });

  it('renders custom header/footer layout labels', () => {
    render(
      <ThemePreview settings={{ headerLayout: 'Centered Nav', footerLayout: 'Three Columns' }} />
    );
    expect(screen.getByTestId('theme-preview-header')).toHaveTextContent('Centered Nav');
    expect(screen.getByTestId('theme-preview-footer')).toHaveTextContent('Three Columns');
  });

  it('applies the primaryColor to the sample button background', () => {
    render(<ThemePreview settings={{ primaryColor: '#123456' }} />);
    const button = screen.getByRole('button', { name: 'Sample Button' });
    expect(button).toHaveStyle({ backgroundColor: '#123456' });
  });

  it('applies fontFamily parsed from typographyText', () => {
    render(<ThemePreview settings={{ typographyText: '{"fontFamily":"Georgia"}' }} />);
    expect(screen.getByTestId('theme-preview-frame')).toHaveStyle({ fontFamily: 'Georgia' });
  });

  it('does not crash on invalid typographyText JSON', () => {
    render(<ThemePreview settings={{ typographyText: 'not json' }} />);
    expect(screen.getByTestId('theme-preview-frame')).toBeInTheDocument();
  });

  it('renders two sample cards', () => {
    render(<ThemePreview settings={{}} />);
    expect(screen.getByText('Card A')).toBeInTheDocument();
    expect(screen.getByText('Card B')).toBeInTheDocument();
  });
});
