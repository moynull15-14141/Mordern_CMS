import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('renders initials from a two-word display name', () => {
    render(<UserAvatar displayName="Jane Doe" email="jane@example.com" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('falls back to the first two characters of the email when displayName is null', () => {
    render(<UserAvatar displayName={null} email="jane@example.com" />);
    expect(screen.getByText('JA')).toBeInTheDocument();
  });

  it('falls back to the email when displayName is an empty/whitespace string', () => {
    render(<UserAvatar displayName="   " email="zed@example.com" />);
    expect(screen.getByText('ZE')).toBeInTheDocument();
  });

  it('uses the display name (or email) as the accessible label', () => {
    render(<UserAvatar displayName="Jane Doe" email="jane@example.com" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
  });

  it('renders no <img> tag and no network request — placeholder only', () => {
    const { container } = render(<UserAvatar displayName="Jane Doe" email="jane@example.com" />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });
});
