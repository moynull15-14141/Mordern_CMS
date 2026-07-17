import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RenameMediaAssetDto } from './rename-media-asset.dto';

describe('RenameMediaAssetDto validation', () => {
  it('accepts a valid filename', async () => {
    const dto = plainToInstance(RenameMediaAssetDto, { filename: 'New Name.png' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing filename', async () => {
    const dto = plainToInstance(RenameMediaAssetDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'filename')).toBe(true);
  });

  it('rejects an empty filename', async () => {
    const dto = plainToInstance(RenameMediaAssetDto, { filename: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'filename')).toBe(true);
  });
});
