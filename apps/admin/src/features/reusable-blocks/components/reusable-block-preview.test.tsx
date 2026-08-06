import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReusableBlockPreview } from './reusable-block-preview';

describe('ReusableBlockPreview', () => {
  it('summarizes the block using its blockType/data/children', () => {
    render(
      <ReusableBlockPreview
        block={{ blockType: 'paragraph', data: { text: 'Hello world' }, children: null }}
      />
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});
