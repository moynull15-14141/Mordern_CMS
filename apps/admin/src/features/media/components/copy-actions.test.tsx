import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyActions } from './copy-actions';
import { toast } from '@/lib/toast';

vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const writeTextMock = vi.fn().mockResolvedValue(undefined);

function mockClipboard() {
  // jsdom defines `navigator.clipboard` as a getter-only property —
  // `Object.assign`'s plain assignment silently no-ops against it (or
  // throws under strict mode), so the descriptor itself must be replaced.
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: writeTextMock },
    configurable: true,
  });
}

beforeEach(() => {
  mockClipboard();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('CopyActions', () => {
  it('does not render a Copy URL action (no URL field exists)', () => {
    render(<CopyActions media={{ id: 'm1', filename: 'photo.jpg' }} />);
    expect(screen.queryByRole('button', { name: /Copy URL/ })).not.toBeInTheDocument();
  });

  it('copies the filename to the clipboard and toasts success', async () => {
    const user = userEvent.setup();
    mockClipboard(); // userEvent.setup() replaces navigator.clipboard itself
    render(<CopyActions media={{ id: 'm1', filename: 'photo.jpg' }} />);

    await user.click(screen.getByRole('button', { name: 'Copy filename' }));

    expect(writeTextMock).toHaveBeenCalledWith('photo.jpg');
    expect(toast.success).toHaveBeenCalledWith('Filename copied.');
  });

  it('copies the id to the clipboard and toasts success', async () => {
    const user = userEvent.setup();
    mockClipboard(); // userEvent.setup() replaces navigator.clipboard itself
    render(<CopyActions media={{ id: 'm1', filename: 'photo.jpg' }} />);

    await user.click(screen.getByRole('button', { name: 'Copy ID' }));

    expect(writeTextMock).toHaveBeenCalledWith('m1');
    expect(toast.success).toHaveBeenCalledWith('ID copied.');
  });
});
