import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApproveCommentDto } from './approve-comment.dto';
import { RejectCommentDto } from './reject-comment.dto';
import { SpamCommentDto } from './spam-comment.dto';

describe('ApproveCommentDto validation', () => {
  it('accepts an empty payload (reason is optional)', async () => {
    const dto = plainToInstance(ApproveCommentDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a reason string', async () => {
    const dto = plainToInstance(ApproveCommentDto, { reason: 'ok' });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a non-string reason', async () => {
    const dto = plainToInstance(ApproveCommentDto, { reason: 123 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });
});

describe('RejectCommentDto validation', () => {
  it('requires a reason', async () => {
    const dto = plainToInstance(RejectCommentDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('rejects an empty reason', async () => {
    const dto = plainToInstance(RejectCommentDto, { reason: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'reason')).toBe(true);
  });

  it('accepts a valid reason', async () => {
    const dto = plainToInstance(RejectCommentDto, { reason: 'spam-like content' });
    expect(await validate(dto)).toHaveLength(0);
  });
});

describe('SpamCommentDto validation', () => {
  it('accepts an empty payload (reason is optional)', async () => {
    const dto = plainToInstance(SpamCommentDto, {});
    expect(await validate(dto)).toHaveLength(0);
  });

  it('accepts a reason string', async () => {
    const dto = plainToInstance(SpamCommentDto, { reason: 'bulk link spam' });
    expect(await validate(dto)).toHaveLength(0);
  });
});
