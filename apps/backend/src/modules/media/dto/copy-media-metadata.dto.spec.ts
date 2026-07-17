import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CopyMediaMetadataDto } from './copy-media-metadata.dto';

describe('CopyMediaMetadataDto validation', () => {
  it('accepts a valid targetId', async () => {
    const dto = plainToInstance(CopyMediaMetadataDto, {
      targetId: '123e4567-e89b-12d3-a456-426614174000',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing targetId', async () => {
    const dto = plainToInstance(CopyMediaMetadataDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'targetId')).toBe(true);
  });

  it('rejects a non-UUID targetId', async () => {
    const dto = plainToInstance(CopyMediaMetadataDto, { targetId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'targetId')).toBe(true);
  });
});
