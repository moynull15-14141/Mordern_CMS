import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateArticleDto } from './create-article.dto';

const VALID = {
  title: 'Hello World',
  body: { blocks: [] },
  authorId: '123e4567-e89b-12d3-a456-426614174000',
  language: 'en',
  locale: 'en-US',
};

describe('CreateArticleDto validation', () => {
  it('accepts a minimal valid payload', async () => {
    const dto = plainToInstance(CreateArticleDto, VALID);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing title', async () => {
    const dto = plainToInstance(CreateArticleDto, { ...VALID, title: undefined });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('rejects a non-UUID authorId', async () => {
    const dto = plainToInstance(CreateArticleDto, { ...VALID, authorId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'authorId')).toBe(true);
  });

  it('accepts a nested valid seo object', async () => {
    const dto = plainToInstance(CreateArticleDto, { ...VALID, seo: { title: 'SEO title' } });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid nested seo.canonicalUrl', async () => {
    const dto = plainToInstance(CreateArticleDto, { ...VALID, seo: { canonicalUrl: 'not-a-url' } });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'seo')).toBe(true);
  });
});
