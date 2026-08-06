import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GalleryBlock } from './gallery-block';

describe('GalleryBlock', () => {
  it('renders every valid image', () => {
    render(
      <GalleryBlock
        block={{
          id: 'b1',
          type: 'gallery',
          data: {
            images: [
              { url: 'https://example.com/1.jpg', alt: 'One' },
              { url: 'https://example.com/2.jpg', alt: 'Two' },
            ],
          },
        }}
      />
    );
    expect(screen.getByRole('img', { name: 'One' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Two' })).toBeInTheDocument();
  });

  it('filters out invalid entries', () => {
    render(
      <GalleryBlock
        block={{
          id: 'b1',
          type: 'gallery',
          data: { images: [{ url: 'x.jpg' }, { alt: 'no url' }] },
        }}
      />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing for an empty gallery', () => {
    const { container } = render(<GalleryBlock block={{ id: 'b1', type: 'gallery', data: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
