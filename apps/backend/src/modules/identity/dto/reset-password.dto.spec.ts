import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ResetPasswordDto } from './reset-password.dto';

describe('ResetPasswordDto validation (password policy)', () => {
  it('accepts a password meeting every rule (8+ chars, upper, lower, number, special)', async () => {
    const dto = plainToInstance(ResetPasswordDto, { token: 't', newPassword: 'StrongP@ss1' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it.each([
    ['alllowercase1!', 'missing uppercase'],
    ['ALLUPPERCASE1!', 'missing lowercase'],
    ['NoNumber!Here', 'missing number'],
    ['NoSpecial123A', 'missing special character'],
    ['Sh0rt!', 'below minimum length'],
  ])('rejects "%s" (%s)', async (value) => {
    const dto = plainToInstance(ResetPasswordDto, { token: 't', newPassword: value });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });
});
