import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SeoValidateRequestDto } from './seo-validation.dto';

describe('SeoValidateRequestDto validation', () => {
  it('accepts an entirely empty payload', async () => {
    const dto = plainToInstance(SeoValidateRequestDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a fully populated payload', async () => {
    const dto = plainToInstance(SeoValidateRequestDto, {
      title: 'A title',
      description: 'A description',
      robots: { index: true },
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects robots that is not an object', async () => {
    const dto = plainToInstance(SeoValidateRequestDto, { robots: 'not-an-object' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'robots')).toBe(true);
  });
});
