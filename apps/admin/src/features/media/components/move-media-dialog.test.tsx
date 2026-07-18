import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoveMediaDialog } from './move-media-dialog';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';

vi.mock('../hooks/use-media-folder-tree', () => ({ useMediaFolderTree: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('MoveMediaDialog', () => {
  it('submits the selected folderId', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({
      data: [{ id: 'f1', name: 'Photos', slug: 'photos', parentId: null, childrenCount: 0, assetCount: 0, createdAt: '', updatedAt: '', deletedAt: null, children: [] }],
      isError: false,
    } as never);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MoveMediaDialog open onOpenChange={vi.fn()} currentFolderId={null} onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Photos' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));

    expect(onSubmit).toHaveBeenCalledWith({ folderId: 'f1' });
  });

  it('submits null folderId when "No folder" is selected', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({
      data: [{ id: 'f1', name: 'Photos', slug: 'photos', parentId: null, childrenCount: 0, assetCount: 0, createdAt: '', updatedAt: '', deletedAt: null, children: [] }],
      isError: false,
    } as never);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MoveMediaDialog open onOpenChange={vi.fn()} currentFolderId="f1" onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'No folder' }));
    await user.click(screen.getByRole('button', { name: 'Move' }));

    expect(onSubmit).toHaveBeenCalledWith({ folderId: null });
  });
});
