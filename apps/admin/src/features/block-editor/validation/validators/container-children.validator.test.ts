import { describe, expect, it } from 'vitest';
import { validateContainerChildren } from './container-children.validator';

describe('validateContainerChildren', () => {
  it('flags a leaf block that carries children', () => {
    const issues = validateContainerChildren([
      {
        id: 'b1',
        type: 'paragraph',
        data: {},
        children: [{ id: 'c1', type: 'paragraph', data: {} }],
      },
    ]);
    expect(issues).toHaveLength(1);
  });

  it('allows a container block to carry children', () => {
    const issues = validateContainerChildren([
      {
        id: 'b1',
        type: 'container',
        data: {},
        children: [{ id: 'c1', type: 'paragraph', data: {} }],
      },
    ]);
    expect(issues).toEqual([]);
  });
});
