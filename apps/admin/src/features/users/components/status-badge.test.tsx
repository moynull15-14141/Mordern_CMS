import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it.each([
    ['ACTIVE', 'Active'],
    ['INACTIVE', 'Inactive'],
    ['SUSPENDED', 'Suspended'],
    ['PENDING', 'Pending'],
  ] as const)('renders the correct label for %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
