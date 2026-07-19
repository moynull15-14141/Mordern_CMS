import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd } from './json-ld';

describe('JsonLd', () => {
  it('renders nothing when data is null or undefined', () => {
    const { container: withNull } = render(<JsonLd data={null} />);
    expect(withNull).toBeEmptyDOMElement();

    const { container: withUndefined } = render(<JsonLd data={undefined} />);
    expect(withUndefined).toBeEmptyDOMElement();
  });

  it('renders a script[type=application/ld+json] with the serialized data', () => {
    const { container } = render(<JsonLd data={{ '@type': 'WebPage', name: 'About' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.innerHTML)).toEqual({ '@type': 'WebPage', name: 'About' });
  });

  it('escapes "<" so a string value cannot break out of the script tag', () => {
    const { container } = render(
      <JsonLd data={{ description: '</script><script>alert(1)</script>' }} />
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script!.innerHTML).not.toContain('</script><script>');
    expect(JSON.parse(script!.innerHTML).description).toBe('</script><script>alert(1)</script>');
  });
});
