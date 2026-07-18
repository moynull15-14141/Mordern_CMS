import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeaturedImageField } from './featured-image-field';
import { useMediaList } from '@/features/media/hooks/use-media-list';

vi.mock('@/features/media/hooks/use-media-list', () => ({ useMediaList: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('FeaturedImageField', () => {
  it('shows "No image selected" and a "Choose image" button when empty', () => {
    vi.mocked(useMediaList).mockReturnValue({ data: undefined, isLoading: false, isError: false } as never);
    render(<FeaturedImageField value="" onChange={vi.fn()} />);
    expect(screen.getByText('No image selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose image' })).toBeInTheDocument();
  });

  it('shows the selected media id and a Clear button when set, and clears on click', async () => {
    vi.mocked(useMediaList).mockReturnValue({ data: undefined, isLoading: false, isError: false } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FeaturedImageField value="m1" onChange={onChange} />);

    expect(screen.getByText('m1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('shows the picked media filename after a selection is made', async () => {
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [
          {
            id: 'm1',
            type: 'IMAGE',
            status: 'READY',
            storageKey: 'a.jpg',
            filename: 'cover.jpg',
            folderId: null,
            mimeType: 'image/jpeg',
            filesize: '100',
            width: null,
            height: null,
            duration: null,
            altText: null,
            caption: null,
            credit: null,
            uploadedBy: 'u1',
            usageCount: 0,
            usages: [],
            createdAt: '',
            updatedAt: '',
            deletedAt: null,
          },
        ],
        meta: { pagination: { page: 1, limit: 12, total: 1, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FeaturedImageField value="" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Choose image' }));
    await user.click(screen.getByText('cover.jpg'));

    expect(onChange).toHaveBeenCalledWith('m1');
  });
});
