import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateCommentDto } from './update-comment.dto';

describe('UpdateCommentDto validation', () => {
  it('accepts a valid body', async () => {
    const dto = plainToInstance(UpdateCommentDto, { body: 'edited text' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing body', async () => {
    const dto = plainToInstance(UpdateCommentDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'body')).toBe(true);
  });

  it('rejects an empty body', async () => {
    const dto = plainToInstance(UpdateCommentDto, { body: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'body')).toBe(true);
  });
});
