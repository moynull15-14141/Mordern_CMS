import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminResetPasswordDto } from './admin-reset-password.dto';

describe('AdminResetPasswordDto validation', () => {
  it('accepts a valid password meeting the policy', async () => {
    const dto = plainToInstance(AdminResetPasswordDto, { newPassword: 'NewPass1!' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing newPassword', async () => {
    const dto = plainToInstance(AdminResetPasswordDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });

  it('rejects a password missing an uppercase letter', async () => {
    const dto = plainToInstance(AdminResetPasswordDto, { newPassword: 'newpass1!' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });

  it('rejects a password missing a digit', async () => {
    const dto = plainToInstance(AdminResetPasswordDto, { newPassword: 'NewPassword!' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });

  it('validation does not complain about an unrelated extraneous currentPassword property (admin flow has no current-password check)', async () => {
    const dto = plainToInstance(AdminResetPasswordDto, {
      newPassword: 'NewPass1!',
      currentPassword: 'ignored',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
