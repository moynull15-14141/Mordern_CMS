import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Published</Badge>);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('applies the default variant classes when none is specified', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toHaveClass('bg-primary');
  });

  it('applies the success variant class', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toHaveClass('bg-success');
  });

  it('applies the destructive variant class', () => {
    render(<Badge variant="destructive">Banned</Badge>);
    expect(screen.getByText('Banned')).toHaveClass('bg-destructive');
  });

  it('merges a custom className with the variant classes', () => {
    render(<Badge className="ml-2">Tagged</Badge>);
    expect(screen.getByText('Tagged')).toHaveClass('ml-2');
  });
});
