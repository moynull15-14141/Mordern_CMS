import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GalleryBlock } from './gallery-block';

const { getMediaMock } = vi.hoisted(() => ({ getMediaMock: vi.fn() }));

vi.mock('../../services/media.service', () => ({
  getMedia: getMediaMock,
}));

describe('GalleryBlock', () => {
  beforeEach(() => {
    getMediaMock.mockReset();
  });

  it('renders every valid legacy-url image (never calls getMedia)', async () => {
    const element = await GalleryBlock({
      block: {
        id: 'b1',
        type: 'gallery',
        data: {
          images: [
            { url: 'https://example.com/1.jpg', alt: 'One' },
            { url: 'https://example.com/2.jpg', alt: 'Two' },
          ],
        },
      },
    });
    render(<>{element}</>);
    expect(screen.getByRole('img', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Two' })).toBeInTheDocument();
    expect(getMediaMock).not.toHaveBeenCalled();
  });

  it('resolves mediaId images in parallel via getMedia', async () => {
    getMediaMock.mockImplementation(async (id: string) => ({
      id,
      urls: { original: `https://cdn.example.com/${id}.png` },
      altText: `Alt for ${id}`,
      blurPlaceholder: null,
    }));
    const element = await GalleryBlock({
      block: {
        id: 'b1',
        type: 'gallery',
        data: {
          images: [
            { mediaId: 'media-1', alt: 'One' },
            { mediaId: 'media-2', alt: 'Two' },
          ],
        },
      },
    });
    render(<>{element}</>);
    expect(screen.getByRole('img', { name: 'One' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/media-1.png'
    );
    expect(screen.getByRole('img', { name: 'Two' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/media-2.png'
    );
  });

  it('filters out invalid entries (no url, no mediaId, or dangling mediaId)', async () => {
    getMediaMock.mockResolvedValue(null);
    const element = await GalleryBlock({
      block: {
        id: 'b1',
        type: 'gallery',
        data: {
          images: [{ url: 'x.jpg' }, { alt: 'no url' }, { mediaId: 'missing', alt: 'dangling' }],
        },
      },
    });
    render(<>{element}</>);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing for an empty gallery', async () => {
    const element = await GalleryBlock({ block: { id: 'b1', type: 'gallery', data: {} } });
    expect(element).toBeNull();
  });
});
