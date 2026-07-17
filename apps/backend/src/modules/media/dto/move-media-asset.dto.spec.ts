import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MoveMediaAssetDto } from './move-media-asset.dto';

describe('MoveMediaAssetDto validation', () => {
  it('accepts an empty payload (move to root)', async () => {
    const dto = plainToInstance(MoveMediaAssetDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid folderId', async () => {
    const dto = plainToInstance(MoveMediaAssetDto, {
      folderId: '123e4567-e89b-12d3-a456-426614174000',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-UUID folderId', async () => {
    const dto = plainToInstance(MoveMediaAssetDto, { folderId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'folderId')).toBe(true);
  });
});
