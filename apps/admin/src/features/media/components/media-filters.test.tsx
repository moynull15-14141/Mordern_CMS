import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaFilters } from './media-filters';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';

vi.mock('../hooks/use-media-folder-tree', () => ({ useMediaFolderTree: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('MediaFilters', () => {
  it('renders Type, Status, Folder, and Uploaded-by controls', () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [] } as never);
    render(<MediaFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Folder')).toBeInTheDocument();
    expect(screen.getByLabelText('Uploaded by (id)')).toBeInTheDocument();
  });

  it('does not render "Clear filters" when nothing is active', () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [] } as never);
    render(<MediaFilters value={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('selecting a type calls onChange with that type', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [] } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MediaFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Type'));
    await user.click(await screen.findByRole('option', { name: 'Image' }));

    expect(onChange).toHaveBeenCalledWith({ type: 'IMAGE' });
  });

  it('flattens the folder tree into selectable options', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({
      data: [
        {
          id: 'f1',
          name: 'Photos',
          slug: 'photos',
          parentId: null,
          childrenCount: 1,
          assetCount: 0,
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
          children: [
            {
              id: 'f2',
              name: 'Events',
              slug: 'events',
              parentId: 'f1',
              childrenCount: 0,
              assetCount: 0,
              createdAt: '',
              updatedAt: '',
              deletedAt: null,
              children: [],
            },
          ],
        },
      ],
    } as never);
    const user = userEvent.setup();
    render(<MediaFilters value={{}} onChange={vi.fn()} />);

    await user.click(screen.getByLabelText('Folder'));
    expect(await screen.findByRole('option', { name: 'Photos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Events' })).toBeInTheDocument();
  });

  it('typing an uploadedBy id calls onChange with that value', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [] } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MediaFilters value={{}} onChange={onChange} />);

    await user.type(screen.getByLabelText('Uploaded by (id)'), 'x');
    expect(onChange).toHaveBeenLastCalledWith({ uploadedBy: 'x' });
  });

  it('shows "Clear filters" once active, and clears on click', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [] } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MediaFilters value={{ type: 'IMAGE' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({});
  });
});
