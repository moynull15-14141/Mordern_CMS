import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

describe('CreateCategoryDto validation', () => {
  it('accepts a minimal valid payload', async () => {
    const dto = plainToInstance(CreateCategoryDto, { name: 'News' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing name', async () => {
    const dto = plainToInstance(CreateCategoryDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects a non-UUID parentId', async () => {
    const dto = plainToInstance(CreateCategoryDto, { name: 'News', parentId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'parentId')).toBe(true);
  });

  it('accepts a nested valid seo object', async () => {
    const dto = plainToInstance(CreateCategoryDto, { name: 'News', seo: { title: 'SEO title' } });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid nested seo.canonicalUrl', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      name: 'News',
      seo: { canonicalUrl: 'not-a-url' },
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'seo')).toBe(true);
  });
});
