import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentFolderSelect } from './parent-folder-select';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';

vi.mock('../hooks/use-media-folder-tree', () => ({ useMediaFolderTree: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

const tree = [
  {
    id: 'f1',
    name: 'Photos',
    slug: 'photos',
    parentId: null,
    childrenCount: 0,
    assetCount: 0,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    children: [],
  },
];

describe('ParentFolderSelect', () => {
  it('lists the flattened folder tree and calls onChange when one is picked', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: tree, isError: false } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ParentFolderSelect value="" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Photos' }));
    expect(onChange).toHaveBeenCalledWith('f1');
  });

  it('shows a permission message instead of the selector when the query errors', () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: undefined, isError: true } as never);
    render(<ParentFolderSelect value="" onChange={vi.fn()} />);
    expect(screen.getByText("You don't have permission to view folders.")).toBeInTheDocument();
  });
});
