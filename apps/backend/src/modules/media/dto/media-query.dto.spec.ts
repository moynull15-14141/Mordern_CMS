import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MediaType } from '@prisma/client';
import { MediaQueryDto } from './media-query.dto';

describe('MediaQueryDto validation', () => {
  it('accepts an empty query (all fields optional)', async () => {
    const dto = plainToInstance(MediaQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid type filter', async () => {
    const dto = plainToInstance(MediaQueryDto, { type: MediaType.IMAGE });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid type filter', async () => {
    const dto = plainToInstance(MediaQueryDto, { type: 'NOT_A_TYPE' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });

  it('rejects a non-date createdFrom', async () => {
    const dto = plainToInstance(MediaQueryDto, { createdFrom: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'createdFrom')).toBe(true);
  });
});
