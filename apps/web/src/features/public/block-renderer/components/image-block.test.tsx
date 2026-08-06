import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageBlock } from './image-block';

describe('ImageBlock', () => {
  it('renders the image with alt text and caption', () => {
    render(
      <ImageBlock
        block={{
          id: 'b1',
          type: 'image',
          data: { url: 'https://example.com/x.jpg', alt: 'A photo', caption: 'Nice shot' },
        }}
      />
    );
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveAttribute('src', 'https://example.com/x.jpg');
    expect(screen.getByText('Nice shot')).toBeInTheDocument();
  });

  it('renders nothing when url is missing', () => {
    const { container } = render(
      <ImageBlock block={{ id: 'b1', type: 'image', data: { alt: 'x' } }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
