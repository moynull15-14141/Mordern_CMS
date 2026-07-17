import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { COMMENT_BODY_MAX_LENGTH } from '../constants/comment.constants';
import { CreateCommentDto } from './create-comment.dto';

const VALID = {
  articleId: '11111111-1111-4111-8111-111111111111',
  body: 'A great article!',
};

describe('CreateCommentDto validation', () => {
  it('accepts a minimal valid top-level comment', async () => {
    const dto = plainToInstance(CreateCommentDto, VALID);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid reply with parentId', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      ...VALID,
      parentId: '22222222-2222-4222-8222-222222222222',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-UUID articleId', async () => {
    const dto = plainToInstance(CreateCommentDto, { ...VALID, articleId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'articleId')).toBe(true);
  });

  it('rejects a non-UUID parentId', async () => {
    const dto = plainToInstance(CreateCommentDto, { ...VALID, parentId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'parentId')).toBe(true);
  });

  it('rejects a missing body', async () => {
    const dto = plainToInstance(CreateCommentDto, { articleId: VALID.articleId });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'body')).toBe(true);
  });

  it('rejects an empty body string', async () => {
    const dto = plainToInstance(CreateCommentDto, { ...VALID, body: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'body')).toBe(true);
  });

  it('rejects a body longer than the max length', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      ...VALID,
      body: 'a'.repeat(COMMENT_BODY_MAX_LENGTH + 1),
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'body')).toBe(true);
  });

  it('accepts a body exactly at the max length', async () => {
    const dto = plainToInstance(CreateCommentDto, {
      ...VALID,
      body: 'a'.repeat(COMMENT_BODY_MAX_LENGTH),
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
