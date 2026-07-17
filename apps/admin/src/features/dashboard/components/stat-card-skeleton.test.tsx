import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileText } from 'lucide-react';
import { StatCardSkeleton } from './stat-card-skeleton';

describe('StatCardSkeleton', () => {
  it('renders the given label', () => {
    render(<StatCardSkeleton label="Articles" icon={FileText} />);
    expect(screen.getByText('Articles')).toBeInTheDocument();
  });

  it('never renders a numeric value — the value slot is always a skeleton', () => {
    const { container } = render(<StatCardSkeleton label="Articles" icon={FileText} />);
    expect(container).not.toHaveTextContent(/\d/);
  });
});
