import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CommentStatus } from '@prisma/client';
import { CommentQueryDto } from './comment-query.dto';

describe('CommentQueryDto validation', () => {
  it('accepts an empty query (all fields optional, defaults applied)', async () => {
    const dto = plainToInstance(CommentQueryDto, {});
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('accepts a full valid query', async () => {
    const dto = plainToInstance(CommentQueryDto, {
      search: 'great',
      articleId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
      parentId: '33333333-3333-4333-8333-333333333333',
      status: CommentStatus.APPROVED,
      page: 2,
      limit: 10,
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an invalid status', async () => {
    const dto = plainToInstance(CommentQueryDto, { status: 'NOT_A_STATUS' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('rejects a non-UUID articleId', async () => {
    const dto = plainToInstance(CommentQueryDto, { articleId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'articleId')).toBe(true);
  });
});
