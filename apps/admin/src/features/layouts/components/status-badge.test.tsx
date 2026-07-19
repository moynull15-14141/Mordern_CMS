import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['PUBLISHED', 'Published'],
    ['ARCHIVED', 'Archived'],
  ] as const)('renders the label for %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
