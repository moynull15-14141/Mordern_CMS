import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MediaType } from '@prisma/client';
import { CreateMediaAssetDto } from './create-media-asset.dto';

const VALID = {
  type: MediaType.IMAGE,
  storageKey: 'uploads/photo.png',
  mimeType: 'image/png',
  filesize: '1024',
};

describe('CreateMediaAssetDto validation', () => {
  it('accepts a minimal valid payload', async () => {
    const dto = plainToInstance(CreateMediaAssetDto, VALID);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid MediaType', async () => {
    const dto = plainToInstance(CreateMediaAssetDto, { ...VALID, type: 'NOT_A_TYPE' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });

  it('rejects a non-numeric filesize', async () => {
    const dto = plainToInstance(CreateMediaAssetDto, { ...VALID, filesize: 'not-a-number' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'filesize')).toBe(true);
  });

  it('rejects a non-UUID folderId', async () => {
    const dto = plainToInstance(CreateMediaAssetDto, { ...VALID, folderId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'folderId')).toBe(true);
  });

  it('accepts optional width/height/duration as integers', async () => {
    const dto = plainToInstance(CreateMediaAssetDto, {
      ...VALID,
      width: 800,
      height: 600,
      duration: 30,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
