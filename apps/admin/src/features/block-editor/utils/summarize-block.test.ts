import { describe, expect, it } from 'vitest';
import { summarizeBlock } from './summarize-block';

describe('summarizeBlock', () => {
  it('summarizes a leaf block using its first non-empty textual field', () => {
    const summary = summarizeBlock({ type: 'paragraph', data: { text: 'Hello world' } });
    expect(summary.typeLabel).toBe('Paragraph');
    expect(summary.text).toBe('Hello world');
  });

  it('falls back to the block definition’s own description when the textual field is empty', () => {
    const summary = summarizeBlock({ type: 'paragraph', data: { text: '' } });
    expect(summary.text).toBe('A block of body text.');
  });

  it('prefers the first field with actual content over an earlier empty one', () => {
    const summary = summarizeBlock({
      type: 'callout',
      data: { title: '', text: 'Important note' },
    });
    expect(summary.text).toBe('Important note');
  });

  it('summarizes a container block by its child count, not a text field', () => {
    const zero = summarizeBlock({ type: 'container', data: {}, children: [] });
    expect(zero.text).toBe('0 blocks');

    const one = summarizeBlock({
      type: 'container',
      data: {},
      children: [{ id: 'a', type: 'paragraph', data: {} }],
    });
    expect(one.text).toBe('1 block');

    const many = summarizeBlock({
      type: 'container',
      data: {},
      children: [
        { id: 'a', type: 'paragraph', data: {} },
        { id: 'b', type: 'paragraph', data: {} },
      ],
    });
    expect(many.text).toBe('2 blocks');
  });

  it('treats a null/missing children array on a container as 0 blocks', () => {
    expect(summarizeBlock({ type: 'container', data: {}, children: null }).text).toBe('0 blocks');
    expect(summarizeBlock({ type: 'container', data: {} }).text).toBe('0 blocks');
  });

  it('truncates long text to keep the summary short', () => {
    const long = 'x'.repeat(200);
    const summary = summarizeBlock({ type: 'paragraph', data: { text: long } });
    expect(summary.text.length).toBeLessThanOrEqual(80);
    expect(summary.text.endsWith('…')).toBe(true);
  });

  it('falls back to a generic icon and the raw type string for an unknown type', () => {
    const summary = summarizeBlock({ type: 'not-a-real-type', data: {} });
    expect(summary.typeLabel).toBe('not-a-real-type');
    expect(summary.text).toBe('not-a-real-type');
  });
});
