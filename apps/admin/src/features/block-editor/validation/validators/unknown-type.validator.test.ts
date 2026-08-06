import { describe, expect, it } from 'vitest';
import { validateUnknownTypes } from './unknown-type.validator';

describe('validateUnknownTypes', () => {
  it('flags a node with an unregistered type', () => {
    const issues = validateUnknownTypes([{ id: 'b1', type: 'not-a-real-type', data: {} }]);
    expect(issues).toHaveLength(1);
  });

  it('passes for every known block type', () => {
    expect(validateUnknownTypes([{ id: 'b1', type: 'paragraph', data: {} }])).toEqual([]);
  });

  it('recurses into children', () => {
    const issues = validateUnknownTypes([
      {
        id: 'b1',
        type: 'container',
        data: {},
        children: [{ id: 'c1', type: 'not-a-real-type', data: {} }],
      },
    ]);
    expect(issues.some((issue) => issue.blockId === 'c1')).toBe(true);
  });
});
