import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComingSoon } from './coming-soon';

describe('ComingSoon', () => {
  it('renders a title including the given section name', () => {
    render(<ComingSoon title="Articles" />);
    expect(screen.getByText("Articles isn't available yet")).toBeInTheDocument();
  });

  it('renders a description', () => {
    render(<ComingSoon title="Articles" />);
    expect(screen.getByText('This section is planned for a future release.')).toBeInTheDocument();
  });

  it('renders no action button', () => {
    render(<ComingSoon title="Articles" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
