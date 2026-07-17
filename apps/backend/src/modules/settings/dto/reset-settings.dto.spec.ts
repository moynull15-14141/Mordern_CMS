import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SettingCategory } from '../enums/setting-category.enum';
import { ResetCategoryDto, ResetResultDto } from './reset-settings.dto';

describe('ResetCategoryDto validation', () => {
  it('accepts a valid SettingCategory', async () => {
    const dto = plainToInstance(ResetCategoryDto, { category: SettingCategory.GENERAL });
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects a missing category', async () => {
    const dto = plainToInstance(ResetCategoryDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('rejects an invalid category value', async () => {
    const dto = plainToInstance(ResetCategoryDto, { category: 'NOT_A_CATEGORY' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });
});

describe('ResetResultDto shape', () => {
  it('holds a reset count', () => {
    const result: ResetResultDto = { resetCount: 5 };
    expect(result.resetCount).toBe(5);
  });
});
