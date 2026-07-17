import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { FormSkeleton } from './form-skeleton';

describe('FormSkeleton', () => {
  it('renders 4 field skeletons by default', () => {
    const { container } = render(<FormSkeleton />);
    expect(container.firstElementChild?.children).toHaveLength(4);
  });

  it('renders a custom number of field skeletons', () => {
    const { container } = render(<FormSkeleton fields={2} />);
    expect(container.firstElementChild?.children).toHaveLength(2);
  });
});
