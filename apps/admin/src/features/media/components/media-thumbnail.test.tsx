import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaThumbnail } from './media-thumbnail';

describe('MediaThumbnail', () => {
  it.each(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'] as const)('renders a labeled placeholder for %s', (type) => {
    render(<MediaThumbnail type={type} />);
    expect(screen.getByRole('img', { name: `${type.toLowerCase()} file` })).toBeInTheDocument();
  });
});
