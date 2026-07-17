import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SeoPreviewRequestDto } from './seo-preview.dto';

describe('SeoPreviewRequestDto validation', () => {
  it('accepts an entirely empty payload', async () => {
    const dto = plainToInstance(SeoPreviewRequestDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a payload with title/description/openGraph', async () => {
    const dto = plainToInstance(SeoPreviewRequestDto, {
      title: 'A title',
      description: 'A description',
      openGraph: { image: 'https://example.com/img.png' },
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-string title', async () => {
    const dto = plainToInstance(SeoPreviewRequestDto, { title: 123 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });
});
