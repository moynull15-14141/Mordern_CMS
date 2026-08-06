import { describe, expect, it } from 'vitest';
import { validateRequiredFields } from './required-fields.validator';

describe('validateRequiredFields', () => {
  it('flags a missing required top-level field', () => {
    const issues = validateRequiredFields([{ id: 'b1', type: 'paragraph', data: {} }]);
    expect(issues).toHaveLength(1);
    expect(issues[0].blockId).toBe('b1');
  });

  it('passes when every required field is present', () => {
    expect(validateRequiredFields([{ id: 'b1', type: 'paragraph', data: { text: 'hi' } }])).toEqual(
      []
    );
  });

  it('recurses into nested list items (table rows-of-cells)', () => {
    const issues = validateRequiredFields([
      { id: 'b1', type: 'table', data: { headers: [], rows: [{ cells: [{}] }] } },
    ]);
    expect(issues.some((issue) => issue.path.includes('rows[0]'))).toBe(true);
  });

  it('skips a block with no registered definition (unknown-type validator handles that)', () => {
    expect(validateRequiredFields([{ id: 'b1', type: 'not-a-real-type', data: {} }])).toEqual([]);
  });
});
