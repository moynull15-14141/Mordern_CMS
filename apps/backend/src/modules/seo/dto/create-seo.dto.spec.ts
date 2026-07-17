import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from '../constants/seo.constants';
import { CreateSeoDto } from './create-seo.dto';

const VALID = { siteId: '11111111-1111-4111-8111-111111111111' };

describe('CreateSeoDto validation', () => {
  it('accepts a minimal valid payload (siteId only)', async () => {
    const dto = plainToInstance(CreateSeoDto, VALID);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a fully populated payload', async () => {
    const dto = plainToInstance(CreateSeoDto, {
      ...VALID,
      title: 'A title',
      description: 'A description',
      keywords: ['a', 'b'],
      canonicalUrl: 'https://example.com',
      openGraph: { title: 'og' },
      twitterCard: { card: 'summary' },
      schemaJson: { '@type': 'Article' },
      robots: { index: true },
      extraMeta: { custom: 'x' },
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-UUID siteId', async () => {
    const dto = plainToInstance(CreateSeoDto, { siteId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'siteId')).toBe(true);
  });

  it('rejects a missing siteId', async () => {
    const dto = plainToInstance(CreateSeoDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'siteId')).toBe(true);
  });

  it('rejects a title exceeding the max length', async () => {
    const dto = plainToInstance(CreateSeoDto, {
      ...VALID,
      title: 'a'.repeat(SEO_TITLE_MAX_LENGTH + 1),
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects a description exceeding the max length', async () => {
    const dto = plainToInstance(CreateSeoDto, {
      ...VALID,
      description: 'a'.repeat(SEO_DESCRIPTION_MAX_LENGTH + 1),
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'description')).toBe(true);
  });

  it('rejects openGraph that is not an object', async () => {
    const dto = plainToInstance(CreateSeoDto, { ...VALID, openGraph: 'not-an-object' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'openGraph')).toBe(true);
  });

  it('rejects keywords that is not an array of strings', async () => {
    const dto = plainToInstance(CreateSeoDto, { ...VALID, keywords: [1, 2, 3] });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'keywords')).toBe(true);
  });
});
