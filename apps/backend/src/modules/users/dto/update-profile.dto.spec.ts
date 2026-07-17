import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProfileVisibility } from '../constants/user.constants';
import { UpdateProfileDto } from './update-profile.dto';

describe('UpdateProfileDto validation', () => {
  it('accepts an empty patch (all fields optional, PATCH semantics)', async () => {
    const dto = plainToInstance(UpdateProfileDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a fully populated, valid patch', async () => {
    const dto = plainToInstance(UpdateProfileDto, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      website: 'https://example.com',
      profileVisibility: ProfileVisibility.PUBLIC,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid website URL', async () => {
    const dto = plainToInstance(UpdateProfileDto, { website: 'not-a-url' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'website')).toBe(true);
  });

  it('rejects an invalid profileVisibility value', async () => {
    const dto = plainToInstance(UpdateProfileDto, { profileVisibility: 'HIDDEN' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'profileVisibility')).toBe(true);
  });
});
