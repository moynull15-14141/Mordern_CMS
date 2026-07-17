import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LockUserDto } from './lock-user.dto';

describe('LockUserDto validation', () => {
  it('accepts an empty payload (reason is optional)', async () => {
    const dto = plainToInstance(LockUserDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a valid reason', async () => {
    const dto = plainToInstance(LockUserDto, { reason: 'Suspicious activity' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-string reason', async () => {
    const dto = plainToInstance(LockUserDto, { reason: 123 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('rejects a reason exceeding the max length', async () => {
    const dto = plainToInstance(LockUserDto, { reason: 'a'.repeat(501) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('accepts a reason exactly at the max length', async () => {
    const dto = plainToInstance(LockUserDto, { reason: 'a'.repeat(500) });
    expect(await validate(dto)).toHaveLength(0);
  });
});
