import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto validation', () => {
  it('accepts a valid email with no password (invite-only flow)', async () => {
    const dto = plainToInstance(CreateUserDto, { email: 'a@b.com' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(CreateUserDto, { email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('accepts a valid email and a policy-compliant password', async () => {
    const dto = plainToInstance(CreateUserDto, { email: 'a@b.com', password: 'StrongP@ss1' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a password that fails the policy', async () => {
    const dto = plainToInstance(CreateUserDto, { email: 'a@b.com', password: 'weak' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});
