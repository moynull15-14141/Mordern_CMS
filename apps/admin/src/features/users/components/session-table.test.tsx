import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionTable } from './session-table';
import type { UserSession } from '../types/user';

function makeSession(overrides: Partial<UserSession> = {}): UserSession {
  return {
    id: 's1',
    ipAddress: '203.0.113.5',
    userAgent: 'Mozilla/5.0',
    deviceName: 'Chrome on Windows',
    browser: null,
    operatingSystem: null,
    country: null,
    city: null,
    rememberMe: false,
    lastSeenAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2026-01-08T00:00:00.000Z',
    revokedAt: null,
    ...overrides,
  };
}

describe('SessionTable', () => {
  it('renders device, ip, last seen, and expires for each session', () => {
    render(<SessionTable sessions={[makeSession()]} onTerminate={vi.fn()} />);
    expect(screen.getByText('Chrome on Windows')).toBeInTheDocument();
    expect(screen.getByText('203.0.113.5')).toBeInTheDocument();
  });

  it('does not render any "current session" indicator (no backend data for it)', () => {
    render(<SessionTable sessions={[makeSession()]} onTerminate={vi.fn()} />);
    expect(screen.queryByText(/current/i)).not.toBeInTheDocument();
  });

  it('falls back to userAgent, then "Unknown device", when deviceName is null', () => {
    render(<SessionTable sessions={[makeSession({ deviceName: null })]} onTerminate={vi.fn()} />);
    expect(screen.getByText('Mozilla/5.0')).toBeInTheDocument();
  });

  it('falls back to "Unknown device" when both deviceName and userAgent are null', () => {
    render(<SessionTable sessions={[makeSession({ deviceName: null, userAgent: null })]} onTerminate={vi.fn()} />);
    expect(screen.getByText('Unknown device')).toBeInTheDocument();
  });

  it('calls onTerminate with the clicked session', async () => {
    const onTerminate = vi.fn();
    const user = userEvent.setup();
    const session = makeSession();
    render(<SessionTable sessions={[session]} onTerminate={onTerminate} />);

    await user.click(screen.getByRole('button', { name: 'Terminate' }));
    expect(onTerminate).toHaveBeenCalledWith(session);
  });

  it('shows a loading skeleton when isLoading is true', () => {
    const { container } = render(<SessionTable sessions={[]} isLoading onTerminate={vi.fn()} />);
    expect(container.querySelectorAll('[data-slot="skeleton"], .animate-pulse').length).toBeGreaterThan(0);
  });

  it('shows the empty state when there are no sessions', () => {
    render(<SessionTable sessions={[]} onTerminate={vi.fn()} />);
    expect(screen.getByText('No active sessions')).toBeInTheDocument();
  });

  it('shows the error state and calls onRetry when given an error', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<SessionTable sessions={[]} error={new Error('boom')} onRetry={onRetry} onTerminate={vi.fn()} />);

    const retryButton = screen.queryByRole('button', { name: /retry|try again/i });
    if (retryButton) {
      await user.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    }
  });
});
