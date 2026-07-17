import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChangePasswordDto } from './change-password.dto';

const VALID = { currentPassword: 'OldPass1!', newPassword: 'NewPass1!' };

describe('ChangePasswordDto validation', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(ChangePasswordDto, VALID);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing currentPassword', async () => {
    const dto = plainToInstance(ChangePasswordDto, { newPassword: VALID.newPassword });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'currentPassword')).toBe(true);
  });

  it('rejects a missing newPassword', async () => {
    const dto = plainToInstance(ChangePasswordDto, { currentPassword: VALID.currentPassword });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });

  it('rejects a newPassword that fails the password policy (too short)', async () => {
    const dto = plainToInstance(ChangePasswordDto, { ...VALID, newPassword: 'Ab1!' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });

  it('rejects a newPassword missing a special character', async () => {
    const dto = plainToInstance(ChangePasswordDto, { ...VALID, newPassword: 'NewPass123' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });

  it('does not apply the password policy to currentPassword', async () => {
    const dto = plainToInstance(ChangePasswordDto, {
      currentPassword: 'anything',
      newPassword: VALID.newPassword,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'currentPassword')).toBe(false);
  });
});
