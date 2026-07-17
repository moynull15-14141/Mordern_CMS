import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MediaFolderQueryDto } from './media-folder-query.dto';

describe('MediaFolderQueryDto validation', () => {
  it('accepts an empty query', async () => {
    const dto = plainToInstance(MediaFolderQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid parentId', async () => {
    const dto = plainToInstance(MediaFolderQueryDto, {
      parentId: '123e4567-e89b-12d3-a456-426614174000',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a non-UUID parentId', async () => {
    const dto = plainToInstance(MediaFolderQueryDto, { parentId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'parentId')).toBe(true);
  });
});
