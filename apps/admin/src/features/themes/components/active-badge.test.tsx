import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveBadge } from './active-badge';

describe('ActiveBadge', () => {
  it('renders "Active" when isActive is true', () => {
    render(<ActiveBadge isActive />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders nothing when isActive is false', () => {
    const { container } = render(<ActiveBadge isActive={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
