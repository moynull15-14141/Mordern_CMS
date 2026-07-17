import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MoveMediaFolderDto } from './move-media-folder.dto';

describe('MoveMediaFolderDto validation', () => {
  it('accepts an empty payload (move to root)', async () => {
    const dto = plainToInstance(MoveMediaFolderDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid parentId', async () => {
    const dto = plainToInstance(MoveMediaFolderDto, {
      parentId: '123e4567-e89b-12d3-a456-426614174000',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-UUID parentId', async () => {
    const dto = plainToInstance(MoveMediaFolderDto, { parentId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'parentId')).toBe(true);
  });
});
