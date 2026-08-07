import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyActions } from './copy-actions';
import { toast } from '@/lib/toast';
import { mediaApi } from '../services/media.api';

vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('../services/media.api', () => ({ mediaApi: { getSignedUrl: vi.fn() } }));

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
  it('copies media.urls.original directly when already resolved (Detail page)', async () => {
    const user = userEvent.setup();
    mockClipboard();
    render(
      <CopyActions
        media={{
          id: 'm1',
          filename: 'photo.jpg',
          urls: { original: 'https://cdn.example.com/photo.jpg' },
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Copy URL' }));

    expect(writeTextMock).toHaveBeenCalledWith('https://cdn.example.com/photo.jpg');
    expect(mediaApi.getSignedUrl).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('URL copied.');
  });

  it('resolves a signed URL on demand when urls.original is absent (e.g. list row for a PRIVATE asset)', async () => {
    (mediaApi.getSignedUrl as ReturnType<typeof vi.fn>).mockResolvedValue({
      url: 'https://signed.example.com/x',
    });
    const user = userEvent.setup();
    mockClipboard();
    render(<CopyActions media={{ id: 'm1', filename: 'photo.jpg' }} />);

    await user.click(screen.getByRole('button', { name: 'Copy URL' }));

    expect(mediaApi.getSignedUrl).toHaveBeenCalledWith('m1');
    expect(writeTextMock).toHaveBeenCalledWith('https://signed.example.com/x');
  });

  it('toasts an error when the signed-url resolution fails', async () => {
    (mediaApi.getSignedUrl as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    mockClipboard();
    render(<CopyActions media={{ id: 'm1', filename: 'photo.jpg' }} />);

    await user.click(screen.getByRole('button', { name: 'Copy URL' }));

    expect(toast.error).toHaveBeenCalled();
    expect(writeTextMock).not.toHaveBeenCalled();
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
