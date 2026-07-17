import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { UserSortField } from '../constants/user.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { UserQueryDto } from './user-query.dto';

describe('UserQueryDto validation', () => {
  it('accepts an empty query, applying defaults', async () => {
    const dto = plainToInstance(UserQueryDto, {});
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
    expect(dto.sortBy).toBe(UserSortField.CREATED_AT);
    expect(dto.sortOrder).toBe(SortOrder.DESC);
  });

  it('accepts a fully populated query', async () => {
    const dto = plainToInstance(UserQueryDto, {
      email: 'a@b.com',
      username: 'user1',
      displayName: 'User One',
      role: 'Editor',
      status: UserStatus.ACTIVE,
      createdFrom: '2026-01-01T00:00:00.000Z',
      createdTo: '2026-02-01T00:00:00.000Z',
      updatedFrom: '2026-01-01T00:00:00.000Z',
      updatedTo: '2026-02-01T00:00:00.000Z',
      search: 'user',
      page: 2,
      limit: 10,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an invalid status', async () => {
    const dto = plainToInstance(UserQueryDto, { status: 'NOT_A_STATUS' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('rejects a non-date createdFrom', async () => {
    const dto = plainToInstance(UserQueryDto, { createdFrom: 'not-a-date' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'createdFrom')).toBe(true);
  });

  it('rejects an invalid sortBy value', async () => {
    const dto = plainToInstance(UserQueryDto, { sortBy: 'notAField' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'sortBy')).toBe(true);
  });
});
