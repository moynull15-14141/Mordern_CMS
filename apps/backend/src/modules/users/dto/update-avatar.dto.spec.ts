import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateAvatarDto } from './update-avatar.dto';

describe('UpdateAvatarDto validation', () => {
  it('accepts a valid UUID', async () => {
    const dto = plainToInstance(UpdateAvatarDto, {
      mediaAssetId: '11111111-1111-4111-8111-111111111111',
    });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing mediaAssetId', async () => {
    const dto = plainToInstance(UpdateAvatarDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'mediaAssetId')).toBe(true);
  });

  it('rejects a non-UUID mediaAssetId', async () => {
    const dto = plainToInstance(UpdateAvatarDto, { mediaAssetId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'mediaAssetId')).toBe(true);
  });
});
