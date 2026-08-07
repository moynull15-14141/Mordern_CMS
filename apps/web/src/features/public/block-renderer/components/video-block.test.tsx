import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { VideoBlock } from './video-block';

const { getMediaMock } = vi.hoisted(() => ({ getMediaMock: vi.fn() }));

vi.mock('../../services/media.service', () => ({
  getMedia: getMediaMock,
}));

describe('VideoBlock', () => {
  beforeEach(() => {
    getMediaMock.mockReset();
  });

  it('renders a video element from the legacy url/poster strings (never calls getMedia)', async () => {
    const element = await VideoBlock({
      block: {
        id: 'b1',
        type: 'video',
        data: {
          url: 'https://example.com/v.mp4',
          poster: 'https://example.com/p.jpg',
          caption: 'Watch',
        },
      },
    });
    const { container } = render(<>{element}</>);
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://example.com/v.mp4');
    expect(video).toHaveAttribute('poster', 'https://example.com/p.jpg');
    expect(getMediaMock).not.toHaveBeenCalled();
  });

  it('resolves mediaId/posterMediaId via getMedia', async () => {
    getMediaMock.mockImplementation(async (id: string) => ({
      id,
      urls: { original: `https://cdn.example.com/${id}` },
      altText: null,
      blurPlaceholder: null,
    }));
    const element = await VideoBlock({
      block: { id: 'b1', type: 'video', data: { mediaId: 'video-1', posterMediaId: 'poster-1' } },
    });
    const { container } = render(<>{element}</>);
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://cdn.example.com/video-1');
    expect(video).toHaveAttribute('poster', 'https://cdn.example.com/poster-1');
  });

  it('renders nothing when mediaId is dangling', async () => {
    getMediaMock.mockResolvedValue(null);
    const element = await VideoBlock({
      block: { id: 'b1', type: 'video', data: { mediaId: 'missing' } },
    });
    expect(element).toBeNull();
  });

  it('renders nothing when neither mediaId nor url is present', async () => {
    const element = await VideoBlock({ block: { id: 'b1', type: 'video', data: {} } });
    expect(element).toBeNull();
  });
});
