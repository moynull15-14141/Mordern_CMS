import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BulkActionToolbar } from './bulk-action-toolbar';
import { mediaBulkApi } from '../services/media-bulk.api';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';

vi.mock('../services/media-bulk.api', () => ({
  mediaBulkApi: {
    move: vi.fn(),
    archive: vi.fn(),
    unarchive: vi.fn(),
    restore: vi.fn(),
    remove: vi.fn(),
  },
}));
vi.mock('../hooks/use-media-folder-tree', () => ({ useMediaFolderTree: vi.fn() }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('BulkActionToolbar', () => {
  it('renders nothing when no ids are selected', () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const { container } = render(<BulkActionToolbar selectedIds={[]} onClear={vi.fn()} />, {
      wrapper: wrapper(),
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the selection count and calls bulkApi.archive + onClear on Archive', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    vi.mocked(mediaBulkApi.archive).mockResolvedValue({ succeeded: ['m1', 'm2'], failed: [] });
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<BulkActionToolbar selectedIds={['m1', 'm2']} onClear={onClear} />, {
      wrapper: wrapper(),
    });

    expect(screen.getByText('2 selected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Archive/ }));

    expect(mediaBulkApi.archive).toHaveBeenCalledWith(['m1', 'm2']);
    expect(onClear).toHaveBeenCalled();
  });

  it('shows Restore instead of Archive/Unarchive/Delete when allDeleted is true', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    vi.mocked(mediaBulkApi.restore).mockResolvedValue({ succeeded: ['m1'], failed: [] });
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<BulkActionToolbar selectedIds={['m1']} onClear={onClear} allDeleted />, {
      wrapper: wrapper(),
    });

    expect(screen.queryByRole('button', { name: /^Archive/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Restore/ }));
    expect(mediaBulkApi.restore).toHaveBeenCalledWith(['m1']);
  });

  it('calls onClear when Clear is clicked', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<BulkActionToolbar selectedIds={['m1']} onClear={onClear} />, { wrapper: wrapper() });

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalled();
  });
});
