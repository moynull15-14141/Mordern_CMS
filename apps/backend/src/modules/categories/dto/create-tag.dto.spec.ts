import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTagDto } from './create-tag.dto';

describe('CreateTagDto validation', () => {
  it('accepts a minimal valid payload', async () => {
    const dto = plainToInstance(CreateTagDto, { name: 'Sports' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing name', async () => {
    const dto = plainToInstance(CreateTagDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('accepts an array of synonyms', async () => {
    const dto = plainToInstance(CreateTagDto, { name: 'Sports', synonyms: ['athletics'] });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-array synonyms value', async () => {
    const dto = plainToInstance(CreateTagDto, { name: 'Sports', synonyms: 'athletics' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'synonyms')).toBe(true);
  });
});
