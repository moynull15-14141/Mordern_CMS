import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateMediaFolderDto } from './update-media-folder.dto';

describe('UpdateMediaFolderDto validation', () => {
  it('accepts an empty patch', async () => {
    const dto = plainToInstance(UpdateMediaFolderDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid name/slug patch', async () => {
    const dto = plainToInstance(UpdateMediaFolderDto, { name: 'New Name', slug: 'new-slug' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a name exceeding the max length', async () => {
    const dto = plainToInstance(UpdateMediaFolderDto, { name: 'a'.repeat(151) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });
});
