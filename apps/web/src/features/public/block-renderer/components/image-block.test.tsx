import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageBlock } from './image-block';

const { getMediaMock } = vi.hoisted(() => ({ getMediaMock: vi.fn() }));

vi.mock('../../services/media.service', () => ({
  getMedia: getMediaMock,
}));

describe('ImageBlock', () => {
  beforeEach(() => {
    getMediaMock.mockReset();
  });

  it('renders a real <picture> with AVIF/WebP sources when mediaId resolves', async () => {
    getMediaMock.mockResolvedValue({
      id: 'media-1',
      urls: {
        original: 'https://cdn.example.com/photo.png',
        webp: 'https://cdn.example.com/photo.webp',
        avif: 'https://cdn.example.com/photo.avif',
      },
      altText: 'A cat',
      blurPlaceholder: 'data:image/jpeg;base64,abc',
    });
    const element = await ImageBlock({
      block: {
        id: 'b1',
        type: 'image',
        data: { mediaId: 'media-1', alt: 'A photo', caption: 'Nice shot' },
      },
    });
    render(<>{element}</>);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/photo.png');
    expect(screen.getByText('Nice shot')).toBeInTheDocument();
    expect(getMediaMock).toHaveBeenCalledWith('media-1');
  });

  it('falls back to alt/altText and hidden webp/avif sources omitted when absent', async () => {
    getMediaMock.mockResolvedValue({
      id: 'media-1',
      urls: { original: 'https://cdn.example.com/photo.png' },
      altText: 'From backend',
      blurPlaceholder: null,
    });
    const element = await ImageBlock({
      block: { id: 'b1', type: 'image', data: { mediaId: 'media-1' } },
    });
    render(<>{element}</>);
    expect(screen.getByRole('img', { name: 'From backend' })).toBeInTheDocument();
  });

  it('renders nothing when mediaId is a dangling reference (getMedia resolves null)', async () => {
    getMediaMock.mockResolvedValue(null);
    const element = await ImageBlock({
      block: { id: 'b1', type: 'image', data: { mediaId: 'missing' } },
    });
    expect(element).toBeNull();
  });

  it('falls back to the legacy data.url string when mediaId is absent (never calls getMedia)', async () => {
    const element = await ImageBlock({
      block: {
        id: 'b1',
        type: 'image',
        data: { url: 'https://example.com/x.jpg', alt: 'A photo', caption: 'Nice shot' },
      },
    });
    render(<>{element}</>);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveAttribute('src', 'https://example.com/x.jpg');
    expect(screen.getByText('Nice shot')).toBeInTheDocument();
    expect(getMediaMock).not.toHaveBeenCalled();
  });

  it('renders nothing when neither mediaId nor url is present', async () => {
    const element = await ImageBlock({ block: { id: 'b1', type: 'image', data: { alt: 'x' } } });
    expect(element).toBeNull();
  });
});
