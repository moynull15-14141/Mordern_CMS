import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { VideoBlock } from './video-block';

describe('VideoBlock', () => {
  it('renders a video element with the src and poster', () => {
    const { container } = render(
      <VideoBlock
        block={{
          id: 'b1',
          type: 'video',
          data: {
            url: 'https://example.com/v.mp4',
            poster: 'https://example.com/p.jpg',
            caption: 'Watch',
          },
        }}
      />
    );
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', 'https://example.com/v.mp4');
    expect(video).toHaveAttribute('poster', 'https://example.com/p.jpg');
  });

  it('renders nothing when url is missing', () => {
    const { container } = render(<VideoBlock block={{ id: 'b1', type: 'video', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
