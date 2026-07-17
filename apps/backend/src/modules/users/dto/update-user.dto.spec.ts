import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto validation', () => {
  it('accepts an empty payload (PATCH semantics)', async () => {
    const dto = plainToInstance(UpdateUserDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a valid username/displayName', async () => {
    const dto = plainToInstance(UpdateUserDto, { username: 'newname', displayName: 'New Name' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a username exceeding the max length', async () => {
    const dto = plainToInstance(UpdateUserDto, { username: 'a'.repeat(51) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });

  it('rejects a displayName exceeding the max length', async () => {
    const dto = plainToInstance(UpdateUserDto, { displayName: 'a'.repeat(151) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'displayName')).toBe(true);
  });

  it('rejects a non-string username', async () => {
    const dto = plainToInstance(UpdateUserDto, { username: 123 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'username')).toBe(true);
  });
});
