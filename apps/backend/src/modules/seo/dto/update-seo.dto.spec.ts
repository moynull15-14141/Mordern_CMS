import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSeoDto } from './update-seo.dto';

describe('UpdateSeoDto validation', () => {
  it('accepts an empty payload (every field optional — PATCH semantics)', async () => {
    const dto = plainToInstance(UpdateSeoDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a partial payload with just a title', async () => {
    const dto = plainToInstance(UpdateSeoDto, { title: 'new title' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('validation does not complain about an unrelated extraneous property (no whitelist enabled at the DTO level)', async () => {
    const dto = plainToInstance(UpdateSeoDto, { siteId: 'ignored', title: 'ok' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid canonicalUrl type', async () => {
    const dto = plainToInstance(UpdateSeoDto, { canonicalUrl: 123 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'canonicalUrl')).toBe(true);
  });
});
