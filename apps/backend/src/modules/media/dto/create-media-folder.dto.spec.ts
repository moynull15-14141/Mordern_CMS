import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMediaFolderDto } from './create-media-folder.dto';

describe('CreateMediaFolderDto validation', () => {
  it('accepts a minimal valid payload', async () => {
    const dto = plainToInstance(CreateMediaFolderDto, { name: 'Photos' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing name', async () => {
    const dto = plainToInstance(CreateMediaFolderDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('rejects a non-UUID parentId', async () => {
    const dto = plainToInstance(CreateMediaFolderDto, { name: 'Photos', parentId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'parentId')).toBe(true);
  });
});
