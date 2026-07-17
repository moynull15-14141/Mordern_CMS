import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MediaStatus } from '@prisma/client';
import { UpdateMediaAssetDto } from './update-media-asset.dto';

describe('UpdateMediaAssetDto validation', () => {
  it('accepts an empty patch (all fields optional)', async () => {
    const dto = plainToInstance(UpdateMediaAssetDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid status', async () => {
    const dto = plainToInstance(UpdateMediaAssetDto, { status: MediaStatus.READY });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status', async () => {
    const dto = plainToInstance(UpdateMediaAssetDto, { status: 'NOT_A_STATUS' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('accepts altText/caption/credit strings', async () => {
    const dto = plainToInstance(UpdateMediaAssetDto, {
      altText: 'Alt',
      caption: 'Cap',
      credit: 'Cred',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
