import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it.each([
    ['DRAFT', 'Draft'],
    ['REVIEW', 'In Review'],
    ['SCHEDULED', 'Scheduled'],
    ['PUBLISHED', 'Published'],
    ['ARCHIVED', 'Archived'],
    ['DELETED', 'Deleted'],
  ] as const)('renders the label for %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
