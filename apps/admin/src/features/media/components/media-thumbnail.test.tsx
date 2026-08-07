import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaThumbnail } from './media-thumbnail';

describe('MediaThumbnail', () => {
  it.each(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'] as const)(
    'renders a labeled placeholder for %s',
    (type) => {
      render(<MediaThumbnail type={type} />);
      expect(screen.getByRole('img', { name: `${type.toLowerCase()} file` })).toBeInTheDocument();
    }
  );

  it('renders a real <img> when status is READY and a thumbnail URL is present', () => {
    render(
      <MediaThumbnail
        type="IMAGE"
        status="READY"
        thumbnailUrl="https://cdn.example.com/t.jpg"
        alt="A cat"
      />
    );
    const img = screen.getByRole('img', { name: 'A cat' });
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/t.jpg');
  });

  it('falls back to the icon placeholder while PROCESSING even if a thumbnailUrl were somehow present', () => {
    render(
      <MediaThumbnail
        type="IMAGE"
        status="PROCESSING"
        thumbnailUrl="https://cdn.example.com/t.jpg"
      />
    );
    expect(screen.getByRole('img', { name: 'image file' })).toBeInTheDocument();
  });

  it('falls back to the icon placeholder when READY but no thumbnailUrl exists', () => {
    render(<MediaThumbnail type="DOCUMENT" status="READY" />);
    expect(screen.getByRole('img', { name: 'document file' })).toBeInTheDocument();
  });
});
