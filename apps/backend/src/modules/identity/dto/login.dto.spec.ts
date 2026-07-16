import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto validation', () => {
  it('passes for a valid email + non-empty password', async () => {
    const dto = plainToInstance(LoginDto, { email: 'user@example.com', password: 'anything' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(LoginDto, { email: 'not-an-email', password: 'anything' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects an empty password', async () => {
    const dto = plainToInstance(LoginDto, { email: 'user@example.com', password: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('accepts an optional rememberMe boolean and deviceName string', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'user@example.com',
      password: 'anything',
      rememberMe: true,
      deviceName: 'Chrome on macOS',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
