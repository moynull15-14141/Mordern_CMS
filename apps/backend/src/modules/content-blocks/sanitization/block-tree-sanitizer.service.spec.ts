import { BlockTreeSanitizer } from './block-tree-sanitizer.service';

describe('BlockTreeSanitizer', () => {
  const sanitizer = new BlockTreeSanitizer();

  it('strips disallowed tags and event-handler attributes from html-block', () => {
    const result = sanitizer.sanitize({
      blocks: [
        {
          id: 'b1',
          type: 'html-block',
          data: { html: '<p>hi</p><script>alert(1)</script><img src=x onerror=alert(1)>' },
        },
      ],
    });
    const html = (result.blocks as never[])[0]['data' as never]['html' as never] as string;
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror');
    expect(html).toContain('<p>hi</p>');
  });

  it('strips javascript: URLs from href/src', () => {
    const result = sanitizer.sanitize({
      blocks: [
        { id: 'b1', type: 'html-block', data: { html: '<a href="javascript:alert(1)">x</a>' } },
      ],
    });
    const html = (result.blocks as never[])[0]['data' as never]['html' as never] as string;
    expect(html).not.toContain('javascript:');
  });

  it('adds rel="noopener noreferrer" to target=_blank links', () => {
    const result = sanitizer.sanitize({
      blocks: [
        {
          id: 'b1',
          type: 'html-block',
          data: { html: '<a href="https://example.com" target="_blank">x</a>' },
        },
      ],
    });
    const html = (result.blocks as never[])[0]['data' as never]['html' as never] as string;
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('allows a safe subset of tags through unchanged in structure', () => {
    const result = sanitizer.sanitize({
      blocks: [
        {
          id: 'b1',
          type: 'html-block',
          data: { html: '<p>Hello <strong>world</strong></p><ul><li>one</li></ul>' },
        },
      ],
    });
    const html = (result.blocks as never[])[0]['data' as never]['html' as never] as string;
    expect(html).toBe('<p>Hello <strong>world</strong></p><ul><li>one</li></ul>');
  });

  it('leaves non-html-block data untouched', () => {
    const result = sanitizer.sanitize({
      blocks: [{ id: 'b1', type: 'paragraph', data: { text: '<script>alert(1)</script>' } }],
    });
    const text = (result.blocks as never[])[0]['data' as never]['text' as never] as string;
    expect(text).toBe('<script>alert(1)</script>');
  });

  it('sanitizes html-block nodes nested inside a container', () => {
    const result = sanitizer.sanitize({
      blocks: [
        {
          id: 'container-1',
          type: 'container',
          data: {},
          children: [
            { id: 'html-1', type: 'html-block', data: { html: '<script>alert(1)</script>' } },
          ],
        },
      ],
    });
    const nested = (result.blocks as never[])[0]['children' as never][0 as never]['data' as never][
      'html' as never
    ] as string;
    expect(nested).not.toContain('<script>');
  });

  it('bypasses sanitization entirely when trusted is true', () => {
    const raw = '<script>alert(1)</script>';
    const result = sanitizer.sanitize(
      { blocks: [{ id: 'b1', type: 'html-block', data: { html: raw } }] },
      { trusted: true }
    );
    const html = (result.blocks as never[])[0]['data' as never]['html' as never] as string;
    expect(html).toBe(raw);
  });

  describe('sanitizeBlockData', () => {
    it('sanitizes a single reusable block’s data by blockType', () => {
      const result = sanitizer.sanitizeBlockData('html-block', {
        html: '<script>alert(1)</script><p>ok</p>',
      });
      expect(result.html).not.toContain('<script>');
      expect(result.html).toContain('<p>ok</p>');
    });

    it('bypasses sanitization when trusted is true', () => {
      const raw = '<script>alert(1)</script>';
      const result = sanitizer.sanitizeBlockData('html-block', { html: raw }, { trusted: true });
      expect(result.html).toBe(raw);
    });
  });
});
