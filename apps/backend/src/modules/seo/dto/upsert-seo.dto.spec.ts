import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpsertSeoDto } from './upsert-seo.dto';

const VALID_SITE = { siteId: '11111111-1111-4111-8111-111111111111' };

describe('UpsertSeoDto validation', () => {
  it('accepts a payload with no id (create path)', async () => {
    const dto = plainToInstance(UpsertSeoDto, VALID_SITE);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a payload with a valid id (update path)', async () => {
    const dto = plainToInstance(UpsertSeoDto, {
      ...VALID_SITE,
      id: '22222222-2222-4222-8222-222222222222',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-UUID id', async () => {
    const dto = plainToInstance(UpsertSeoDto, { ...VALID_SITE, id: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'id')).toBe(true);
  });

  it('still requires siteId (inherited from CreateSeoDto)', async () => {
    const dto = plainToInstance(UpsertSeoDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'siteId')).toBe(true);
  });
});
